import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useThemeStore } from '@store/theme';
import { useAuth, useUser } from '@clerk/clerk-react';
import { getTechBadgeByName } from '@constants/position-tech-stack';
import { getProjectDetail } from '@apis/project-detail';
import { applyProject } from '@apis/apply';
import type { ProjectItem, Position, TechStack } from '@t/project/api';
import {
  PROJECT_LIST,
  RECOMMENDED_PROJECTS,
  type ProjectListItem,
  type RecommendedProject,
} from 'src/mocks/project.mock';
import { badgeToneToClass, type BadgeTone } from 'src/shared/types/badgeTone';
import BookmarkIcon from '@assets/icons/bookmark.svg?react';

type ProjectDetailInfo = {
  id: string;
  categoryLabel?: string;
  deadlineLabel?: string;
  title: string;
  location?: string;
  period?: string;
  mode?: string;
  dueLabel?: string;
  summary?: string;
  creatorName?: string;
  imageUrls?: string[];
  roles?: ProjectRoleInfo[];
};

type ProjectRoleInfo = {
  key: string;
  label: string;
  tone: BadgeTone;
  current: number;
  total: number;
  techStacks: string[];
};

type RecruitmentLike = {
  position?: Position | string;
  positionName?: string;
  currentCount?: number;
  count?: number;
  techStacks?: TechStack[] | null;
};

const toProjectDetailInfo = (project: RecommendedProject | ProjectListItem): ProjectDetailInfo => ({
  id: project.id,
  categoryLabel: project.categoryLabel,
  deadlineLabel: project.deadlineLabel,
  title: project.title,
  location: project.location,
  period: project.period,
  mode: project.mode,
  dueLabel: 'dueLabel' in project ? project.dueLabel : undefined,
});

const toProjectDetailInfoFromApi = (project: ProjectItem): ProjectDetailInfo => {
  const summary =
    'content' in project && typeof project.content === 'string' ? project.content : undefined;
  const imageUrls =
    'imageUrls' in project && Array.isArray(project.imageUrls) ? project.imageUrls : [];
  const recruitments =
    'recruitments' in project && Array.isArray(project.recruitments)
      ? (project.recruitments as RecruitmentLike[])
      : project.positions ?? [];

  return {
    id: String(project.projectId),
    categoryLabel: project.projectFieldName,
    deadlineLabel: project.categoryName,
    title: project.title,
    location: project.location,
    period: `${project.durationMonths}개월`,
    mode: project.modeName,
    dueLabel: project.recruitmentDeadline,
    summary,
    creatorName: project.creatorName,
    imageUrls: imageUrls.filter(Boolean),
    roles: recruitments.map((recruitment) => {
      const positionKey = recruitment.position as Position;
      const label =
        (typeof recruitment.positionName === 'string' && recruitment.positionName) ||
        positionLabelByKey[positionKey] ||
        (typeof recruitment.position === 'string' ? recruitment.position : '포지션');
      return {
        key: typeof recruitment.position === 'string' ? recruitment.position : String(positionKey),
        label,
        tone: badgeToneByPosition[positionKey] ?? 'blue',
        current: recruitment.currentCount ?? 0,
        total: recruitment.count ?? 0,
        techStacks: Array.isArray(recruitment.techStacks)
          ? recruitment.techStacks
              .map((stack) => stack.techStackName)
              .filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
          : [],
      };
    }),
  };
};

const badgeToneByPosition: Partial<Record<Position, BadgeTone>> = {
  BACKEND: 'green',
  FRONTEND: 'blue',
  DESIGN: 'pink',
  PM: 'blue',
  IOS: 'orange',
  ANDROID: 'orange',
};

const positionLabelByKey: Partial<Record<Position, string>> = {
  BACKEND: '백엔드',
  FRONTEND: '프론트엔드',
  DESIGN: '디자인',
  PM: 'PM',
  IOS: 'iOS',
  ANDROID: '안드로이드',
};

type RoleBadgeProps = {
  label: string;
  tone: BadgeTone;
};

const RoleBadge = ({ label, tone }: RoleBadgeProps) => (
  <span
    className={`inline-flex items-center whitespace-nowrap rounded-lg px-3 py-1 font-semibold text-[12px] ${badgeToneToClass[tone]}`}
  >
    {label}
  </span>
);

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [apiProject, setApiProject] = useState<ProjectDetailInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    let isActive = true;

    const fetchProject = async () => {
      setIsLoading(true);
      try {
        const numericId = Number(projectId);
        if (Number.isNaN(numericId)) {
          if (isActive) setApiProject(null);
          return;
        }
        const token = await getToken();
        const result = await getProjectDetail(numericId, token);
        if (!isActive) return;
        setApiProject(result ? toProjectDetailInfoFromApi(result) : null);
      } catch {
        if (isActive) {
          setApiProject(null);
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void fetchProject();
    return () => {
      isActive = false;
    };
  }, [projectId]);

  const fallbackProject =
    PROJECT_LIST.find((project) => project.id === projectId) ??
    RECOMMENDED_PROJECTS.find((project) => project.id === projectId);
  const sessionProject = useMemo(() => {
    if (!projectId) return undefined;
    try {
      const raw = sessionStorage.getItem(`project_detail_${projectId}`);
      if (!raw) return undefined;
      return JSON.parse(raw) as ProjectDetailInfo;
    } catch {
      return undefined;
    }
  }, [projectId]);

  const project =
    apiProject ?? sessionProject ?? (fallbackProject ? toProjectDetailInfo(fallbackProject) : undefined);
  const roleOptions = useMemo(() => {
    if (project?.roles && project.roles.length > 0) {
      return project.roles.map((role) => ({ key: role.key, label: role.label }));
    }
    return [
      { key: 'frontend', label: '프론트엔드' },
      { key: 'backend', label: '백엔드' },
      { key: 'infra', label: '인프라' },
    ];
  }, [project?.roles]);
  const selectedRoleLabel =
    roleOptions.find((option) => option.key === selectedRole)?.label ?? '포지션';
  const isDark = theme === 'dark';
  const renderTechBadge = (tech: string, key: string) => {
    const badge = getTechBadgeByName(tech);
    if (!badge) {
      return (
        <span
          key={key}
          className="inline-flex items-center rounded-full border border-[var(--ui-200)] bg-[var(--ui-100)] px-3 py-1 text-sm text-[var(--ui-800)]"
        >
          {tech}
        </span>
      );
    }

    const src = isDark ? badge.offDark ?? badge.off : badge.off;
    return (
      <img
        key={key}
        src={src}
        alt={`${tech} 배지`}
        className="h-12 w-auto"
        loading="lazy"
      />
    );
  };

  if (!projectId || (!project && !isLoading)) {
    return <div>프로젝트 정보를 찾을 수 없습니다.</div>;
  }
  if (!project) {
    return <div>프로젝트 정보를 불러오는 중입니다.</div>;
  }

  const handleApply = async () => {
    if (!projectId || !selectedRole) return;
    if (isLoaded && !isSignedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      setIsApplying(true);
      const token = await getToken();
      if (!token) {
        setIsLoginModalOpen(true);
        return;
      }
      await applyProject(Number(projectId), token);
      setHasApplied(true);
      setIsApplyModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('프로젝트 지원에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-10 pb-20">
      <header className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card-bg text-[var(--ui-700)] hover:opacity-80"
          aria-label="뒤로가기"
        >
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </header>

      <section className="flex flex-col gap-8 rounded-3xl bg-card-bg p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
          <div className="flex min-w-0 flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => {
                  const imageUrl = project.imageUrls?.[index];
                  return (
                    <div
                      key={`project-image-${index}`}
                      className="h-[160px] w-full overflow-hidden rounded-2xl bg-card-section-bg"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`${project.title} 이미지 ${index + 1}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {project.categoryLabel && (
                    <span className="inline-flex rounded-lg bg-badge-bg-gray px-3 py-1 font-medium text-badge-text-gray text-base">
                      {project.categoryLabel}
                    </span>
                  )}
                  {project.deadlineLabel && (
                    <span className="inline-flex rounded-lg bg-badge-bg-gray px-3 py-1 font-medium text-badge-text-gray text-base">
                      {project.deadlineLabel}
                    </span>
                  )}
                </div>
                <div className="flex items-start gap-3">
                  <h1 className="max-w-[800px] text-[24px] font-semibold text-card-title lg:text-[28px]">
                    {project.title}
                  </h1>
                  <button
                    type="button"
                    className="mt-2 ml-auto h-[52px] w-[52px] shrink-0 text-card-muted hover:opacity-80"
                    aria-label="북마크"
                  >
                    <BookmarkIcon className="h-[52px] w-[52px]" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex items-center gap-3 text-card-muted">
                  <div className="h-12 w-12 rounded-full bg-card-section-bg" />
                  <span className="text-xl font-semibold text-[var(--ui-1000)]">
                    {project.creatorName ?? '닉네임'}
                  </span>
                </div>
                {hasApplied && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsApplyModalOpen(true);
                      setIsRoleMenuOpen(false);
                    }}
                    className="mt-2 inline-flex h-[36px] w-full items-center justify-center gap-2 rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-100)] text-[14px] font-medium text-[var(--ui-500)]"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                    수정하기
                  </button>
                )}
              </div>
            </div>

            <div className="h-px w-full bg-card-border" />
          </div>

          <div className="flex flex-col gap-3 lg:mt-[230px] lg:items-end">
            {!hasApplied && (
              <button
                type="button"
                onClick={() => {
                  if (isLoaded && !isSignedIn) {
                    setIsLoginModalOpen(true);
                    return;
                  }
                  setIsApplyModalOpen(true);
                  setIsRoleMenuOpen(false);
                }}
                className="h-[44px] w-[240px] rounded-[12px] bg-[#4E49FF] px-6 text-[16px] font-medium text-white hover:opacity-80"
              >
                지원하기
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="grid gap-x-12 gap-y-8 text-card-muted lg:grid-cols-2">
              <div className="grid grid-cols-[96px_1fr] items-center gap-x-10">
                <span className="text-[15px]">프로젝트 유형</span>
                <span className="text-[15px] font-semibold text-card-title">
                  {project.categoryLabel ?? '모바일/앱'}
                </span>
              </div>
              <div className="grid grid-cols-[96px_1fr] items-center gap-x-10">
                <span className="text-[15px]">도메인</span>
                <span className="text-[15px] font-semibold text-card-title">
                  {project.deadlineLabel ?? '추후 결정 예정'}
                </span>
              </div>
              <div className="grid grid-cols-[96px_1fr] items-center gap-x-10">
                <span className="text-[15px]">진행 장소</span>
                <span className="text-[15px] font-semibold text-card-title">
                  {project.location ?? '추후 결정 예정'}
                </span>
              </div>
              <div className="grid grid-cols-[96px_1fr] items-center gap-x-10">
                <span className="text-[15px]">진행 방식</span>
                <span className="text-[15px] font-semibold text-card-title">
                  {project.mode ?? '온라인/오프라인'}
                </span>
              </div>
              <div className="grid grid-cols-[96px_1fr] items-center gap-x-10">
                <span className="text-[15px]">진행 기간</span>
                <span className="text-[15px] font-semibold text-card-title">
                  {project.period ?? '추후 결정 예정'}
                </span>
              </div>
              <div className="grid grid-cols-[96px_1fr] items-center gap-x-10">
                <span className="text-[15px]">모집 마감일</span>
                <span className="text-[15px] font-semibold text-card-title">
                  {project.dueLabel ?? '추후 결정 예정'}
                </span>
              </div>
            </div>

            <section className="mt-4 flex flex-col gap-4">
              <h2
                className="text-[15px] font-medium"
                style={{ color: isDark ? '#7F8596' : '#939AAE' }}
              >
                모집 분야
              </h2>
              {project.roles?.length ? (
                project.roles.map((role) => (
                  <div key={role.key} className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <RoleBadge label={role.label} tone={role.tone} />
                      <span className="text-card-muted text-sm">
                        {role.current}/{role.total}명
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(role.techStacks) && role.techStacks.length > 0 ? (
                        role.techStacks.map((tech) =>
                          renderTechBadge(tech, `${role.key}-${tech}`),
                        )
                      ) : (
                        <span className="text-sm text-card-muted">기술 스택 정보 없음</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-sm text-card-muted">모집 정보가 없습니다.</span>
              )}
            </section>
          </div>
          <div className="hidden lg:block" />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="text-2xl font-semibold text-card-title">프로젝트 소개</div>
          <div className="flex items-center">
            <span className="h-[2px] w-35 bg-[var(--color-card-title)]" />
            <span className="h-[1.5px] flex-1 bg-[var(--color-card-border)]" />
          </div>
          <p className="max-w-[880px] text-card-muted text-lg leading-relaxed">
            {project.summary ?? '프로젝트 소개 정보가 없습니다.'}
          </p>
          <div className="h-[320px] w-full max-w-[420px] overflow-hidden rounded-2xl bg-card-section-bg">
            {project.imageUrls?.[0] ? (
              <img
                src={project.imageUrls[0]}
                alt={`${project.title} 소개 이미지`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : null}
          </div>
        </div>
        <div className="hidden lg:block" />
      </section>

      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
          <div
            className="relative w-full max-w-[360px] rounded-[24px] px-8 pb-8 pt-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
            style={{ backgroundColor: isDark ? '#212328' : '#FFFFFF' }}
          >
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute right-6 top-6 text-[var(--ui-400)]"
              aria-label="닫기"
            >
              ✕
            </button>
            <div className="flex flex-col gap-2">
              <h2
                className="text-[18px] font-semibold leading-[24px]"
                style={{ color: isDark ? '#F8F9FB' : 'var(--ui-900)' }}
              >
                [{project.title}]
                <br />
                에 지원하시겠어요?
              </h2>
              <p
                className="text-[13px]"
                style={{ color: isDark ? '#9EA6BA' : 'var(--ui-400)' }}
              >
                지원 후 PM이 수락 시 팀원으로 합류하게 됩니다.
              </p>
            </div>

            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="relative w-[240px]">
                <button
                  type="button"
                  onClick={() => setIsRoleMenuOpen((prev) => !prev)}
                  className="flex h-[40px] w-full items-center justify-between rounded-[12px] px-4 text-[14px]"
                  style={{
                    backgroundColor: isDark ? '#191B1E' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#41444D' : 'var(--ui-200)'}`,
                    color: isDark ? '#F8F9FB' : 'var(--ui-700)',
                  }}
                >
                  <span
                    className={selectedRole ? '' : 'text-[var(--ui-400)]'}
                    style={{ color: selectedRole ? (isDark ? '#F8F9FB' : 'var(--ui-900)') : undefined }}
                  >
                    {selectedRoleLabel}
                  </span>
                  <svg
                    className={`h-4 w-4 transition-transform ${isRoleMenuOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {isRoleMenuOpen && (
                  <div
                    className="absolute z-10 mt-2 w-full rounded-[12px] py-2 shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
                    style={{
                      backgroundColor: isDark ? '#191B1E' : '#FFFFFF',
                      border: `1px solid ${isDark ? '#41444D' : 'var(--ui-200)'}`,
                    }}
                  >
                    {roleOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          setSelectedRole(option.key);
                          setIsRoleMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-[14px]"
                        style={{
                          color: isDark ? '#F8F9FB' : 'var(--ui-900)',
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={!selectedRole}
                onClick={handleApply}
                className={`h-[48px] w-full rounded-[12px] text-[16px] font-semibold ${
                  selectedRole && !isApplying
                    ? 'bg-[#4E49FF] text-white'
                    : 'bg-[var(--ui-100)] text-[var(--ui-400)]'
                }`}
              >
                {isApplying ? '지원 중...' : '지원하기'}
              </button>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="text-[14px] text-[var(--ui-400)]"
              >
                나중에 하기
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
          <div
            className="relative w-full max-w-[360px] rounded-[24px] px-8 pb-8 pt-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
            style={{ backgroundColor: isDark ? '#212328' : '#FFFFFF' }}
          >
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute right-6 top-6 text-[var(--ui-400)]"
              aria-label="닫기"
            >
              ✕
            </button>
            <div className="flex flex-col gap-2">
              <h2
                className="text-[18px] font-semibold leading-[24px]"
                style={{ color: isDark ? '#F8F9FB' : 'var(--ui-900)' }}
              >
                로그인 후 이용할 수 있어요
              </h2>
              <p
                className="text-[13px]"
                style={{ color: isDark ? '#9EA6BA' : 'var(--ui-400)' }}
              >
                지원하려면 먼저 로그인해 주세요.
              </p>
            </div>

            <div className="mt-6 flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="h-[48px] w-full rounded-[12px] bg-[#4E49FF] text-[16px] font-semibold text-white"
              >
                로그인 하러가기
              </button>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="text-[14px] text-[var(--ui-400)]"
              >
                나중에 하기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProjectDetailPage;
