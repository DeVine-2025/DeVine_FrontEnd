import { useAuth } from '@clerk/clerk-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginRequiredCard from '@components/common/LoginRequiredCard';
import MainProjectCard from '@components/common/MainProjectCard';
import RecommendDeveloperCard from '@components/common/RecommendDeveloperCard';
import RecommendProjectCard from '@components/common/RecommendProjectCard';
import { useAuthStore } from '@store/auth';
import { PROFILE_CARD_LIST } from 'src/mocks/developer.mock';
import type { ProjectListItem, RecommendedProject } from 'src/mocks/project.mock';
import { PROJECT_LIST, PROJECT_ROLES, RECOMMENDED_PROJECTS } from 'src/mocks/project.mock';
import type { BadgeTone, ProjectCardProps, ProjectRole } from '@t/project/ui';
import { getWeeklyBestProjects, type WeeklyBestProject } from '@apis/project-detail';
import { getRecommendDevelopersPreview } from '@apis/members';
import { getRecommendProjectsPreview, type RecommendProjectPreviewItem } from '@apis/mainrecommendproject';
import { getDueLabel, mapPositionsToRoles } from 'src/shared/mappers/project';
import { createBookmark, deleteBookmark, getBookmarks } from '@apis/bookmarks';

type HighlightProject = ProjectCardProps & { id: number };

type MainRecommendProject = {
  id: string;
  categoryLabel: string;
  deadlineLabel: string;
  title: string;
  thumbnailUrl?: string;
  location?: string;
  period?: string;
  mode?: string;
  dueLabel?: string;
  bookmarked?: boolean;
  bookmarkId?: number;
  techSuitability?: number;
  domainSuitability?: number;
  growthPotential?: number;
  overallScore?: number;
};

type MainRecommendDeveloper = {
  id: string;
  memberId?: number;
  role: string;
  roleTone: 'blue' | 'green' | 'pink' | 'orange';
  nickname: string;
  profileImageUrl?: string;
  introduction?: string;
  badges?: Array<{ label: string; tone: BadgeTone }>;
  techStack?: Array<{ id: string; name: string; icon?: React.ReactNode }>;
  bookmarked?: boolean;
  bookmarkId?: number;
};

const ROLE_TONE_BY_POSITION: Record<string, BadgeTone> = {
  BACKEND: 'green',
  FRONTEND: 'blue',
  DESIGN: 'pink',
  IOS: 'orange',
  ANDROID: 'orange',
  PM: 'blue',
  INFRA: 'pink',
};

const mapWeeklyRoles = (positions: WeeklyBestProject['positions']): ProjectRole[] =>
  positions.map((position) => ({
    key: position.position,
    label: position.positionName,
    tone: ROLE_TONE_BY_POSITION[position.position] ?? 'blue',
    current: position.currentCount,
    total: position.count,
    techStack: [],
  }));

const mapWeeklyProject = (project: WeeklyBestProject): HighlightProject => ({
  id: project.projectId,
  title: project.title,
  categoryLabel: project.projectFieldName,
  deadlineLabel: project.categoryName,
  location: project.location,
  period: project.durationRangeName ?? undefined,
  mode: project.modeName,
  thumbnailUrl: project.thumbnailUrl ?? undefined,
  roles: mapWeeklyRoles(project.positions),
});

const MainPage = () => {
  const { isSignedIn, getToken } = useAuth();
  const navigate = useNavigate();
  const userRole = useAuthStore((state) => state.role);
  const isLoggedIn = Boolean(isSignedIn);
  const isPm = userRole === 'pm';
  const isDev = userRole === 'dev';
  const [weeklyProjects, setWeeklyProjects] = useState<HighlightProject[]>([]);
  const fallbackRoles = useMemo(() => PROJECT_ROLES.map((role) => ({ ...role })), []);
  const [recommendedDevelopers, setRecommendedDevelopers] = useState<MainRecommendDeveloper[]>(
    PROFILE_CARD_LIST.slice(0, 3).map((d) => ({ ...d, bookmarkId: undefined })),
  );
  const [recommendedProjects, setRecommendedProjects] = useState<MainRecommendProject[]>(
    PROJECT_LIST.slice(0, 3),
  );
  const [projectBookmarkMap, setProjectBookmarkMap] = useState<Record<number, number>>({});
  const [developerBookmarkMap, setDeveloperBookmarkMap] = useState<Record<number, number>>({});

  // 새로고침에도 북마크 반영: 내 북마크 목록을 하이드레이션
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const token = await getToken();
      if (!token || cancelled) return;
      try {
        const bookmarks = await getBookmarks(token);
        if (cancelled) return;
        const nextProjects: Record<number, number> = {};
        const nextDevelopers: Record<number, number> = {};
        for (const b of bookmarks) {
          if (b.targetType === 'PROJECT') nextProjects[b.targetId] = b.bookmarkId;
          if (b.targetType === 'DEVELOPER') nextDevelopers[b.targetId] = b.bookmarkId;
        }
        setProjectBookmarkMap(nextProjects);
        setDeveloperBookmarkMap(nextDevelopers);
      } catch (e) {
        console.error('[북마크] 목록 로드 실패', e);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const requireToken = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return null;
    }
    return token;
  }, [getToken, navigate]);

  const handleProjectBookmarkChange = useCallback(
    async (targetId: number, next: boolean) => {
      if (!Number.isFinite(targetId) || targetId <= 0) return;
      const token = await requireToken();
      if (!token) return;
      const prevId = projectBookmarkMap[targetId];
      if (next) {
        setProjectBookmarkMap((prev) => ({ ...prev, [targetId]: -1 }));
      } else {
        if (prevId == null || prevId <= 0) return;
        setProjectBookmarkMap((prev) => {
          const n = { ...prev };
          delete n[targetId];
          return n;
        });
      }
      try {
        if (next) {
          const { bookmarkId } = await createBookmark({ targetType: 'PROJECT', targetId }, token);
          setProjectBookmarkMap((prev) => ({ ...prev, [targetId]: bookmarkId }));
        } else {
          await deleteBookmark(prevId, token);
        }
      } catch (e) {
        console.error('[북마크]', e);
        if (next) {
          setProjectBookmarkMap((prev) => {
            const n = { ...prev };
            delete n[targetId];
            return n;
          });
        } else {
          setProjectBookmarkMap((prev) => ({ ...prev, [targetId]: prevId }));
        }
        alert(e instanceof Error ? e.message : '북마크 처리에 실패했습니다.');
      }
    },
    [projectBookmarkMap, requireToken],
  );

  const handleDeveloperBookmarkChange = useCallback(
    async (memberId: number | undefined, next: boolean) => {
      if (memberId == null) {
        alert('개발자 북마크는 현재 지원되지 않습니다.');
        return;
      }
      const token = await requireToken();
      if (!token) return;
      const prevId = developerBookmarkMap[memberId];
      if (next) {
        setDeveloperBookmarkMap((prev) => ({ ...prev, [memberId]: -1 }));
      } else {
        if (prevId == null || prevId <= 0) return;
        setDeveloperBookmarkMap((prev) => {
          const n = { ...prev };
          delete n[memberId];
          return n;
        });
      }
      try {
        if (next) {
          const { bookmarkId } = await createBookmark({ targetType: 'DEVELOPER', targetId: memberId }, token);
          setDeveloperBookmarkMap((prev) => ({ ...prev, [memberId]: bookmarkId }));
        } else {
          await deleteBookmark(prevId, token);
        }
      } catch (e) {
        console.error('[북마크]', e);
        if (next) {
          setDeveloperBookmarkMap((prev) => {
            const n = { ...prev };
            delete n[memberId];
            return n;
          });
        } else {
          setDeveloperBookmarkMap((prev) => ({ ...prev, [memberId]: prevId }));
        }
        alert(e instanceof Error ? e.message : '북마크 처리에 실패했습니다.');
      }
    },
    [developerBookmarkMap, requireToken],
  );

  useEffect(() => {
    let isActive = true;

    const fetchWeeklyProjects = async () => {
      try {
        const projects = await getWeeklyBestProjects();
        if (!isActive) return;
        setWeeklyProjects(projects.map(mapWeeklyProject));
      } catch {
        if (isActive) {
          setWeeklyProjects([]);
        }
      }
    };

    void fetchWeeklyProjects();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !isPm) return;
    let isActive = true;

    const fetchRecommendedDevelopers = async () => {
      try {
        const token = await getToken();
        if (!token || !isActive) return;
        const result = await getRecommendDevelopersPreview(3, token);
        if (!isActive) return;
        const mapped = result.map((d, index) => ({
          id: `member-preview-${index}-${d.nickname}`,
          memberId: d.memberId,
          role: '개발자',
          roleTone: 'blue' as const,
          nickname: d.nickname,
          profileImageUrl: d.image ?? '',
          introduction: d.body ?? '',
          badges: [],
          techStack: (d.techstacks ?? []).map((name, i) => ({ id: `t-${index}-${i}`, name })),
          bookmarked: d.bookmarked,
          bookmarkId: d.bookmarkId,
        }));
        setRecommendedDevelopers(mapped);
      } catch {
        if (isActive) {
          setRecommendedDevelopers(PROFILE_CARD_LIST.slice(0, 3));
        }
      }
    };

    void fetchRecommendedDevelopers();
    return () => {
      isActive = false;
    };
  }, [getToken, isLoggedIn, isPm]);

  useEffect(() => {
    if (!isLoggedIn || userRole !== 'dev') return;
    let isActive = true;

    const fetchRecommendedProjects = async () => {
      try {
        const token = await getToken();
        if (!token || !isActive) return;
        const result = await getRecommendProjectsPreview(4, token);
        if (!isActive) return;
        const mapped = result.map((item: RecommendProjectPreviewItem) => ({
          id: String(item.projectId),
          categoryLabel: item.projectFieldName,
          deadlineLabel: item.categoryName,
          title: item.title,
          thumbnailUrl: item.thumbnailUrl ?? '',
          location: item.location,
          period: item.durationRangeName ?? undefined,
          mode: item.modeName,
          dueLabel: getDueLabel(item.daysUntilDeadline) ?? '추후 결정 예정',
          bookmarked: item.bookmarked,
          bookmarkId: item.bookmarkId,
          roles: mapPositionsToRoles(item.positions as never),
          techSuitability: item.techScore,
          domainSuitability: item.domainScore,
          growthPotential: item.techStackCountScore,
          overallScore: item.totalScore,
        }));
        setRecommendedProjects(mapped);
      } catch {
        if (isActive) {
          setRecommendedProjects(PROJECT_LIST.slice(0, 3));
        }
      }
    };

    void fetchRecommendedProjects();
    return () => {
      isActive = false;
    };
  }, [getToken, isLoggedIn, isPm]);

  const highlightProjects: HighlightProject[] = useMemo(() => {
    if (weeklyProjects.length > 0) {
      return weeklyProjects;
    }
    return RECOMMENDED_PROJECTS.slice(0, 4).map((project, index) => ({
      id: Number.parseInt(project.id.replace(/\D/g, ''), 10) || index,
      title: project.title,
      categoryLabel: project.categoryLabel,
      deadlineLabel: project.deadlineLabel,
      location: project.location,
      period: project.period,
      mode: project.mode,
      bookmarked: project.bookmarked,
      roles: fallbackRoles,
      thumbnailUrl: undefined,
    }));
  }, [weeklyProjects, fallbackRoles]);
  const recommendedProfiles = recommendedDevelopers;
  const recommendTitle = isLoggedIn
    ? isPm
      ? '나에게 딱 맞는 추천 개발자'
      : '나에게 딱 맞는 추천 프로젝트'
    : '나에게 딱 맞는 추천 프로젝트/개발자';
  const loginCtaLabel = !isLoggedIn
    ? '나에게 딱 맞는 추천 프로젝트/개발자'
    : null;  
  const handleProjectClick = (
    project: RecommendedProject | ProjectListItem | HighlightProject | MainRecommendProject,
  ) => {
    try {
      const payload = {
        id: String(project.id),
        categoryLabel: 'categoryLabel' in project ? project.categoryLabel : undefined,
        deadlineLabel: 'deadlineLabel' in project ? project.deadlineLabel : undefined,
        title: project.title,
        location: project.location,
        period: project.period,
        mode: project.mode,
        dueLabel: 'dueLabel' in project ? project.dueLabel : undefined,
        roles: 'roles' in project ? project.roles : undefined,
      };
      sessionStorage.setItem(`project_detail_${project.id}`, JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
    navigate(`/project/${project.id}`);
  };

  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-14">
      <section className="flex flex-col gap-6">
        <h2 className="Heading2 pt-5 font-semibold text-card-title">
          이번주 모두가 주목하는 프로젝트
        </h2>
        <div className="scrollbar-hide flex justify-between gap-6 overflow-x-auto">
          {highlightProjects.map((project) => (
            <MainProjectCard
              key={project.id}
              categoryLabel={project.categoryLabel}
              deadlineLabel={project.deadlineLabel}
              title={project.title}
              location={project.location}
              period={project.period}
              mode={project.mode}
              roles={project.roles}
              bookmarked={
                projectBookmarkMap[project.id] != null ? true : (project.bookmarked ?? false)
              }
              onBookmarkChange={(next) => handleProjectBookmarkChange(project.id, next)}
              thumbnailUrl={project.thumbnailUrl}
              onClick={() => handleProjectClick(project)}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="Heading2 font-semibold text-card-title">
          {recommendTitle}
        </h2>
        <div className="relative">
          <div
            className={`flex flex-col gap-6 ${
              isLoggedIn ? '' : 'pointer-events-none select-none blur-sm'
            }`}
          >
            {isPm
              ? recommendedProfiles.map((profile) => (
                  <RecommendDeveloperCard
                    key={profile.id}
                    role={profile.role}
                    roleTone={profile.roleTone}
                    nickname={profile.nickname}
                    profileImageUrl={profile.profileImageUrl}
                    introduction={profile.introduction}
                    domains={profile.badges?.map((badge) => ({ label: badge.label }))}
                    techStack={profile.techStack}
                    bookmarked={
                      profile.memberId != null
                        ? developerBookmarkMap[profile.memberId] != null
                        : (profile.bookmarked ?? false)
                    }
                    onBookmarkChange={(next) => handleDeveloperBookmarkChange(profile.memberId, next)}
                    matchedReason="의 Java/Springboot 요구사항과 일치합니다."
                  />
                ))
              : recommendedProjects.map((project) => (
                  (() => {
                    const targetId = Number(project.id);
                    const hasNumericId = Number.isFinite(targetId) && targetId > 0;
                    const isBookmarked = hasNumericId
                      ? projectBookmarkMap[targetId] != null
                      : (project.bookmarked ?? false);
                    return (
                  <RecommendProjectCard
                    key={project.id}
                    categoryLabel={project.categoryLabel}
                    deadlineLabel={project.deadlineLabel}
                    title={project.title}
                    location={project.location}
                    period={project.period}
                    mode={project.mode}
                    roles={[...PROJECT_ROLES]}
                    dueLabel={project.dueLabel}
                    bookmarked={isBookmarked}
                    techSuitability={project.techSuitability}
                    domainSuitability={project.domainSuitability}
                    growthPotential={project.growthPotential}
                    overallScore={project.overallScore}
                    onBookmarkChange={(next) =>
                      hasNumericId ? handleProjectBookmarkChange(targetId, next) : undefined
                    }
                    onClick={() => handleProjectClick(project)}
                  />
                    );
                  })()
                ))}
          </div>

          {!isLoggedIn && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoginRequiredCard description={loginCtaLabel ?? '나에게 딱 맞는 추천 프로젝트/개발자를 보려면 로그인해 주세요.'} />
            </div>
          )}
        </div>
      </section>
    </section>
  );
};

export default MainPage;
