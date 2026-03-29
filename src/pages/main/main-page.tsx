import { createBookmark, deleteBookmark, getBookmarks } from '@apis/bookmarks';
import {
  getRecommendProjectsPreview,
  type RecommendProjectPreviewItem,
} from '@apis/mainrecommendproject';
import { getRecommendDevelopersPreview } from '@apis/members';
import { getWeeklyBestProjects, type WeeklyBestProject } from '@apis/project-detail';
import { getReports } from '@apis/report/report-queries';
import { useAuth } from '@clerk/clerk-react';
import LoginRequiredCard from '@components/common/LoginRequiredCard';
import MainProjectCard from '@components/common/MainProjectCard';
import RecommendDeveloperCard from '@components/common/RecommendDeveloperCard';
import RecommendProjectCard from '@components/common/RecommendProjectCard';
import ReportRequiredCard from '@components/common/ReportRequiredCard';
import LoginModal from '@pages/project-detail/components/LoginModal';
import { useAuthStore } from '@store/auth';
import { useThemeStore } from '@store/theme';
import type { BadgeTone, ProjectCardProps, ProjectRole } from '@t/project/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDueLabel, mapRecommendPositionsToRoles } from 'src/shared/mappers/project';
import { getMyProjectsAllStatuses } from '@apis/projects';

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
  roles?: ProjectRole[];
  techstackScorePercent?: number | null;
  similarityScorePercent?: number | null;
  domainMatch?: boolean | null;
  totalScore?: number | null;
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
  durationRangeName: project.durationRangeName ?? undefined,
  mode: project.modeName,
  thumbnailUrl: project.thumbnailUrl ?? undefined,
  roles: mapWeeklyRoles(project.positions),
});

const MainPage = () => {
  const { isSignedIn, getToken } = useAuth();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const userRole = useAuthStore((state) => state.role);
  const isLoggedIn = Boolean(isSignedIn);
  const isPm = userRole === 'pm';
  const isDev = userRole === 'dev';
  const isDevOrUnknown = isDev || userRole == null;
  const [weeklyProjects, setWeeklyProjects] = useState<HighlightProject[]>([]);
  const [recommendedDevelopers, setRecommendedDevelopers] = useState<MainRecommendDeveloper[]>([]);
  const [hasReport, setHasReport] = useState<boolean | null>(null);
  const [hasProjects, setHasProjects] = useState<boolean | null>(null);
  const [isDeveloperPreviewEmpty, setIsDeveloperPreviewEmpty] = useState(false);
  const [matchedProjectName, setMatchedProjectName] = useState<string>('A 프로젝트');
  const [recommendedProjects, setRecommendedProjects] = useState<MainRecommendProject[]>([]);
  const [projectBookmarkMap, setProjectBookmarkMap] = useState<Record<number, number>>({});
  const [developerBookmarkMap, setDeveloperBookmarkMap] = useState<Record<string | number, number>>(
    {},
  );
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const MY_PROJECTS_CACHE_KEY = 'devine_my_projects_cache_v1';
  const isDark = theme === 'dark';

  const readMyProjectsCache = useCallback(() => {
    try {
      const raw = localStorage.getItem(MY_PROJECTS_CACHE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((p: any) => ({
          projectId: Number(p?.id),
          title: String(p?.name ?? '').trim(),
        }))
        .filter(
          (p: any) => Number.isFinite(p.projectId) && p.projectId > 0 && p.title.length > 0,
        ) as Array<{ projectId: number; title: string }>;
    } catch {
      return [];
    }
  }, []);

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
        const nextDevelopers: Record<string | number, number> = {};
        for (const b of bookmarks) {
          if (b.targetType === 'PROJECT' && b.targetId != null)
            nextProjects[b.targetId] = b.bookmarkId;
          if (b.targetType === 'DEVELOPER') {
            const key = b.targetNickname ?? b.targetId;
            if (key !== undefined && key !== null) nextDevelopers[key] = b.bookmarkId;
          }
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

  // 로그인 사용자 리포트 유무 확인
  useEffect(() => {
    if (!isLoggedIn) {
      setHasReport(null);
      return;
    }
    let cancelled = false;
    getReports()
      .then((res) => {
        if (cancelled) return;
        const reports = res?.result?.reports ?? [];
        setHasReport(reports.length > 0);
      })
      .catch(() => {
        if (!cancelled) setHasReport(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  // 프로젝트 등록 여부 확인 (역할/상태 무관)
  useEffect(() => {
    if (!isLoggedIn) {
      setHasProjects(null);
      return;
    }
    let cancelled = false;
    getToken()
      .then((token) => {
        if (!token || cancelled) return;
        return getMyProjectsAllStatuses(token);
      })
      .then((projects) => {
        if (cancelled || projects == null) return;
        if (projects.length > 0) {
          setHasProjects(true);
          return;
        }
        // 서버 반영 지연/상태 미포함 시 로컬 캐시 fallback (프로젝트 생성 직후 즉시 반영)
        const cached = readMyProjectsCache();
        setHasProjects(cached.length > 0);
      })
      .catch(() => {
        if (!cancelled) {
          const cached = readMyProjectsCache();
          setHasProjects(cached.length > 0 ? true : null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, getToken, readMyProjectsCache]);

  const requireToken = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setIsLoginModalOpen(true);
      return null;
    }
    return token;
  }, [getToken]);

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
    async (memberId: number | undefined, nickname: string, next: boolean) => {
      const mapKey = memberId ?? nickname;
      const token = await requireToken();
      if (!token) return;
      const prevId = developerBookmarkMap[mapKey];
      if (next) {
        setDeveloperBookmarkMap((prev) => ({ ...prev, [mapKey]: -1 }));
      } else {
        if (prevId == null || prevId <= 0) return;
        setDeveloperBookmarkMap((prev) => {
          const n = { ...prev };
          delete n[mapKey];
          return n;
        });
      }
      try {
        if (next) {
          const { bookmarkId } = await createBookmark(
            { targetType: 'DEVELOPER', targetNickname: nickname },
            token,
          );
          setDeveloperBookmarkMap((prev) => ({ ...prev, [mapKey]: bookmarkId }));
        } else {
          await deleteBookmark(prevId, token);
        }
      } catch (e) {
        console.error('[북마크]', e);
        if (next) {
          setDeveloperBookmarkMap((prev) => {
            const n = { ...prev };
            delete n[mapKey];
            return n;
          });
        } else {
          setDeveloperBookmarkMap((prev) => ({ ...prev, [mapKey]: prevId }));
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

  // PM이면 추천 개발자 fetch (프로젝트 있을 때)
  useEffect(() => {
    if (!isLoggedIn || !isPm || hasProjects !== true) return;
    let isActive = true;

    const fetchRecommendedDevelopers = async () => {
      try {
        const token = await getToken();
        if (!token || !isActive) return;
        const myProjects = await getMyProjectsAllStatuses(token);
        const firstProject = myProjects[0];
        const fallback = !firstProject ? readMyProjectsCache()[0] : null;
        const targetProjectId = firstProject?.projectId ?? fallback?.projectId;
        const title = firstProject?.title ?? fallback?.title;
        if (title) setMatchedProjectName(title);
        if (!targetProjectId) {
          setIsDeveloperPreviewEmpty(true);
          setRecommendedDevelopers([]);
          return;
        }
        const result = await getRecommendDevelopersPreview(3, token, targetProjectId);
        if (!isActive) return;
        if (result.length === 0) {
          setIsDeveloperPreviewEmpty(true);
          setRecommendedDevelopers([]);
          return;
        }
        setIsDeveloperPreviewEmpty(false);
        const mapped = result.map((d, index) => {
          const roleTone: MainRecommendDeveloper['roleTone'] =
            d.mainType === 'PM' ? 'blue' : 'green';
          return {
            id: `member-preview-${index}-${d.nickname}`,
            memberId: d.memberId,
            role: d.mainType === 'PM' ? 'PM' : '개발자',
            roleTone,
            nickname: d.nickname,
            profileImageUrl: d.image ?? '',
            introduction: d.body ?? '',
            badges: (d.domains ?? []).map((domain) => ({ label: domain, tone: roleTone })),
            techStack: (d.techstacks ?? []).map((name, i) => ({ id: `t-${index}-${i}`, name })),
            bookmarked: d.bookmarked,
            bookmarkId: d.bookmarkId,
          };
        });
        setRecommendedDevelopers(mapped);
      } catch {
        if (isActive) {
          setIsDeveloperPreviewEmpty(false);
          setRecommendedDevelopers([]);
        }
      }
    };

    void fetchRecommendedDevelopers();
    return () => {
      isActive = false;
    };
  }, [getToken, isLoggedIn, isPm, hasProjects]);

  useEffect(() => {
    if (!isLoggedIn || !isDevOrUnknown || hasReport !== true) return;
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
          roles: mapRecommendPositionsToRoles(item.positions),
          techstackScorePercent: item.techstackScorePercent ?? item.techScore ?? null,
          similarityScorePercent: item.similarityScorePercent ?? item.techStackCountScore ?? null,
          domainMatch: item.domainMatch ?? null,
          totalScore: item.totalScore ?? null,
        }));
        setRecommendedProjects(mapped);
      } catch {
        if (isActive) setRecommendedProjects([]);
      }
    };

    void fetchRecommendedProjects();
    return () => {
      isActive = false;
    };
  }, [getToken, isLoggedIn, isDevOrUnknown, hasReport]);

  useEffect(() => {
    if (!isLoggedIn) {
      setRecommendedProjects([]);
    }
  }, [isLoggedIn]);

  const highlightProjects: HighlightProject[] = useMemo(() => {
    if (weeklyProjects.length > 0) {
      return weeklyProjects;
    }
    return [];
  }, [weeklyProjects]);
  const recommendedProfiles = recommendedDevelopers;
  const recommendTitle = isLoggedIn
    ? isPm
      ? hasProjects
        ? '나에게 딱 맞는 추천 개발자'
        : '나에게 딱 맞는 추천 프로젝트/개발자'
      : hasReport
        ? '나에게 딱 맞는 추천 프로젝트'
        : '나에게 딱 맞는 추천 프로젝트/개발자'
    : '나에게 딱 맞는 추천 프로젝트/개발자';
  const loginCtaLabel = !isLoggedIn ? '로그인해야 추천 프로젝트/개발자를 확인할 수 있어요' : null;
  const isEmptyRecommendedProjectsState =
    isLoggedIn && !isPm && hasReport === true && recommendedProjects.length === 0;
  const handleProjectClick = (project: HighlightProject | MainRecommendProject) => {
    try {
      const payload = {
        id: String(project.id),
        categoryLabel: 'categoryLabel' in project ? project.categoryLabel : undefined,
        deadlineLabel: 'deadlineLabel' in project ? project.deadlineLabel : undefined,
        title: project.title,
        location: project.location,
        durationRangeName: project.deadlineLabel,
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
          <div className="grid grid-cols-4 gap-6">
            {highlightProjects.map((project) => (
              <MainProjectCard
                key={project.id}
                categoryLabel={project.categoryLabel}
                deadlineLabel={project.deadlineLabel}
                title={project.title}
                location={project.location}
                durationRangeName={project.durationRangeName}
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

      <section
        className={`flex flex-col gap-6 ${
          !isLoggedIn ? 'mb-0 pt-8' : isEmptyRecommendedProjectsState ? 'mb-0' : 'mb-40'
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="Heading2 font-semibold text-card-title">{recommendTitle}</h2>
        </div>
        {isLoggedIn ? (
          <div className="relative">
            <div className="flex flex-col gap-6">
              {isPm && hasProjects === false ? (
                <div className="flex items-center justify-center py-6">
                  <ReportRequiredCard
                    title="프로젝트를 등록하면 맞춤 추천을 받을 수 있어요"
                    description="나에게 맞는 추천 개발자를 받아 보세요"
                    linkLabel="프로젝트 등록하러 가기"
                    linkTo="/project/create"
                  />
                </div>
              ) : (
                isPm && hasProjects === true ? (
                  isDeveloperPreviewEmpty ? (
                    <div className="flex h-[180px] items-center justify-center rounded-2xl border border-card-border bg-card-bg text-card-muted">
                      나에게 딱 맞는 추천 개발자가 아직 없어요.
                    </div>
                  ) : (
                    recommendedProfiles.map((profile) => (
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
                          developerBookmarkMap[profile.memberId ?? profile.nickname] != null ||
                          (profile.bookmarked ?? false)
                        }
                        bookmarkId={(() => {
                          const id = developerBookmarkMap[profile.memberId ?? profile.nickname];
                          return id != null && id > 0 ? id : undefined;
                        })()}
                        onBookmarkChange={(next) =>
                          handleDeveloperBookmarkChange(profile.memberId, profile.nickname, next)
                        }
                        matchedProjectName={matchedProjectName}
                        matchedReason="프로젝트의 요구사항과 일치합니다."
                        onClick={() => navigate(`/developer-detail/${profile.nickname}`)}
                      />
                    ))
                  )
                ) : !isPm && hasReport === false ? (
                  <div className="flex items-center justify-center py-6">
                    <ReportRequiredCard
                      title="리포트를 등록하면 맞춤 추천을 받을 수 있어요"
                      description="나에게 맞는 추천 프로젝트를 받아 보세요"
                      linkLabel="리포트 등록하러 가기"
                      linkTo="/report/create"
                    />
                  </div>
                ) : !isPm ? (
                  recommendedProjects.length === 0 ? (
                    <div className="flex h-[180px] items-center justify-center rounded-2xl border border-card-border bg-card-bg text-card-muted">
                      나에게 딱 맞는 추천 프로젝트가 아직 없어요.
                    </div>
                  ) : (
                    recommendedProjects.map((project) =>
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
                            thumbnailUrl={project.thumbnailUrl}
                            thumbnailAlt={project.title}
                            location={project.location}
                            period={project.period}
                            mode={project.mode}
                            roles={project.roles}
                            dueLabel={project.dueLabel}
                            bookmarked={isBookmarked}
                            techstackScorePercent={project.techstackScorePercent}
                            similarityScorePercent={project.similarityScorePercent}
                            domainMatch={project.domainMatch}
                            totalScore={project.totalScore}
                            projectId={project.id}
                            bookmarkId={project.bookmarkId}
                            onBookmarkChange={(next) =>
                              hasNumericId ? handleProjectBookmarkChange(targetId, next) : undefined
                            }
                            onBookmarkChangeById={
                              hasNumericId
                                ? (pid, next, bkid) =>
                                    handleProjectBookmarkChange(Number(pid), next)
                                : undefined
                            }
                            onNavigateToProject={(pid) => navigate(`/project/${pid}`)}
                            onClick={() => handleProjectClick(project)}
                          />
                        );
                      })(),
                    )
                  )
                ) : null
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-[220px] items-center justify-center">
            <LoginRequiredCard
              description={
                loginCtaLabel ?? '나에게 딱 맞는 추천 프로젝트/개발자를 보려면 로그인해 주세요.'
              }
            />
          </div>
        )}
      </section>

      {isLoginModalOpen && (
        <LoginModal
          isDark={isDark}
          onLogin={() => {
            setIsLoginModalOpen(false);
            navigate('/login');
          }}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
    </section>
  );
};

export default MainPage;
