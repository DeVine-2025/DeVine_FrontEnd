import { useAuth } from '@clerk/clerk-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

type HighlightProject = ProjectCardProps & { id: number };

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
  period: `${project.durationMonths}개월`,
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
  const [weeklyProjects, setWeeklyProjects] = useState<HighlightProject[]>([]);
  const fallbackRoles = useMemo(() => PROJECT_ROLES.map((role) => ({ ...role })), []);
  const [recommendedDevelopers, setRecommendedDevelopers] = useState(PROFILE_CARD_LIST.slice(0, 3));
  const [recommendedProjects, setRecommendedProjects] = useState(PROJECT_LIST.slice(0, 3));

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
        const mapped = result.map((item, index) => ({
          id: `${item.nickname}-${index}`,
          role: '개발자',
          roleTone: 'blue' as const,
          nickname: item.nickname,
          profileImageUrl: item.image ?? '',
          introduction: item.body ?? '',
          badges: [],
          techStack: item.techstacks.map((name) => ({ id: name, name })),
          bookmarked: false,
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
    if (!isLoggedIn || isPm) return;
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
          period: `${item.durationMonths}개월`,
          mode: item.modeName,
          dueLabel: getDueLabel(item.daysUntilDeadline) ?? '추후 결정 예정',
          bookmarked: false,
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
  const handleProjectClick = (project: RecommendedProject | ProjectListItem | HighlightProject) => {
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
              bookmarked={project.bookmarked}
              thumbnailUrl={project.thumbnailUrl}
              onClick={() => handleProjectClick(project)}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="Heading2 font-semibold text-card-title">
          나에게 딱 맞는 추천 프로젝트/개발자
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
                    bookmarked={profile.bookmarked}
                    matchedReason="의 Java/Springboot 요구사항과 일치합니다."
                  />
                ))
              : recommendedProjects.map((project) => (
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
                    bookmarked={project.bookmarked}
                    techSuitability={project.techSuitability}
                    domainSuitability={project.domainSuitability}
                    growthPotential={project.growthPotential}
                    overallScore={project.overallScore}
                    onClick={() => handleProjectClick(project)}
                  />
                ))}
          </div>

          {!isLoggedIn && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-[210px] w-[400px] flex-col items-start gap-7 rounded-2xl border border-[#41444D] bg-[#212328] p-11 text-left shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-[21px] text-card-title">
                    로그인이 필요해요
                  </span>
                  <span className="text-[#F8F9FB] text-[15px]">
                    로그인하면 추천 프로젝트를 확인할 수 있어요
                  </span>
                </div>
                <Link
                  to="/login"
                  className="inline-flex h-[52px] w-full items-center justify-center rounded-2xl bg-[#4E49FF] font-semibold text-[18px] text-white"
                >
                  로그인하기
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </section>
  );
};

export default MainPage;
