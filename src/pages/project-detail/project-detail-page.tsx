import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useThemeStore } from '@store/theme';
import { useUser } from '@clerk/clerk-react';
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
};

type ProjectDetailState = {
  project?: ProjectDetailInfo;
};

const MOCK_TECH_STACK = ['Javascript', 'Typescript', 'React', 'Vue.js', 'Next.js', 'Svelte'];
const MOCK_INFRA_STACK = ['AWS', 'Firebase', 'Docker', 'Kubernetes'];
const MOCK_SUMMARY =
  '프로젝트 소개 텍스트가 들어가는 자리입니다. 프로젝트 소개 텍스트가 들어가는 자리입니다. 프로젝트 소개 텍스트가 들어가는 자리입니다.';

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

type RoleBadgeProps = {
  label: string;
  tone: BadgeTone;
};

const RoleBadge = ({ label, tone }: RoleBadgeProps) => (
  <span
    className={`inline-flex items-center whitespace-nowrap rounded-lg px-3 py-1 font-semibold text-base ${badgeToneToClass[tone]}`}
  >
    {label}
  </span>
);

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { isLoaded, isSignedIn } = useUser();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const stateProject = (location.state as ProjectDetailState | null)?.project;
  const fallbackProject =
    PROJECT_LIST.find((project) => project.id === projectId) ??
    RECOMMENDED_PROJECTS.find((project) => project.id === projectId);

  const project = stateProject ?? (fallbackProject ? toProjectDetailInfo(fallbackProject) : undefined);
  if (!projectId || !project) {
    return <div>프로젝트 정보를 찾을 수 없습니다.</div>;
  }

  const roleOptions = useMemo(
    () => [
      { key: 'frontend', label: '프론트엔드' },
      { key: 'backend', label: '백엔드' },
      { key: 'infra', label: '인프라' },
    ],
    [],
  );
  const selectedRoleLabel =
    roleOptions.find((option) => option.key === selectedRole)?.label ?? '포지션';
  const isDark = theme === 'dark';

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
              <div className="h-[160px] w-full rounded-2xl bg-card-section-bg" />
              <div className="h-[160px] w-full rounded-2xl bg-card-section-bg" />
              <div className="h-[160px] w-full rounded-2xl bg-card-section-bg" />
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
                    className="mt-2 ml-auto h-10 w-10 shrink-0 text-card-muted hover:opacity-80"
                    aria-label="북마크"
                  >
                    <BookmarkIcon className="h-9 w-9" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex items-center gap-3 text-card-muted">
                  <div className="h-12 w-12 rounded-full bg-card-section-bg" />
                  <span className="text-xl font-semibold text-[var(--ui-1000)]">닉네임</span>
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
            <button
              type="button"
              className="inline-flex h-[44px] w-[240px] items-center justify-center gap-2 rounded-[12px] border border-[var(--ui-200)] bg-[var(--ui-100)] px-6 text-[var(--ui-500)] hover:opacity-80"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 6h14a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H10l-5 3v-3H5a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z" />
              </svg>
              연락하기
            </button>
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
                className="h-[44px] w-[240px] rounded-[12px] bg-[#4E49FF] px-6 font-semibold text-white hover:opacity-80"
              >
                지원하기
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="grid gap-x-12 gap-y-4 text-card-muted lg:grid-cols-2">
              <div className="flex items-center gap-6">
                <span className="min-w-[84px] text-base">프로젝트 유형</span>
                <span className="text-base font-semibold text-card-title">
                  {project.categoryLabel ?? '모바일/앱'}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="min-w-[84px] text-base">도메인</span>
                <span className="text-base font-semibold text-card-title">
                  {project.deadlineLabel ?? '추후 결정 예정'}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="min-w-[84px] text-base">진행 장소</span>
                <span className="text-base font-semibold text-card-title">
                  {project.location ?? '추후 결정 예정'}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="min-w-[84px] text-base">진행 방식</span>
                <span className="text-base font-semibold text-card-title">
                  {project.mode ?? '온라인/오프라인'}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="min-w-[84px] text-base">진행 기간</span>
                <span className="text-base font-semibold text-card-title">
                  {project.period ?? '추후 결정 예정'}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="min-w-[84px] text-base">모집 마감일</span>
                <span className="text-base font-semibold text-card-title">
                  {project.dueLabel ?? '추후 결정 예정'}
                </span>
              </div>
            </div>

            <section className="flex flex-col gap-4">
              <h2 className="font-semibold text-card-title text-xl">모집 분야</h2>
              <div className="flex items-center gap-3">
                <RoleBadge label="프론트엔드" tone="blue" />
                <span className="text-card-muted text-sm">2/6명</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {MOCK_TECH_STACK.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center rounded-full border border-[var(--ui-200)] bg-[var(--ui-100)] px-3 py-1 text-sm text-[var(--ui-800)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <RoleBadge label="백엔드" tone="green" />
                <span className="text-card-muted text-sm">2/6명</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {MOCK_TECH_STACK.map((tech) => (
                  <span
                    key={`be-${tech}`}
                    className="inline-flex items-center rounded-full border border-[var(--ui-200)] bg-[var(--ui-100)] px-3 py-1 text-sm text-[var(--ui-800)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <RoleBadge label="인프라" tone="pink" />
                <span className="text-card-muted text-sm">2/6명</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {MOCK_INFRA_STACK.map((tech) => (
                  <span
                    key={`infra-${tech}`}
                    className="inline-flex items-center rounded-full border border-[var(--ui-200)] bg-[var(--ui-100)] px-3 py-1 text-sm text-[var(--ui-800)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
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
          <p className="max-w-[880px] text-card-muted text-lg leading-relaxed">{MOCK_SUMMARY}</p>
          <div className="h-[320px] w-full max-w-[420px] rounded-2xl bg-card-section-bg" />
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
                onClick={() => {
                  setHasApplied(true);
                  setIsApplyModalOpen(false);
                }}
                className={`h-[48px] w-full rounded-[12px] text-[16px] font-semibold ${
                  selectedRole
                    ? 'bg-[#4E49FF] text-white'
                    : 'bg-[var(--ui-100)] text-[var(--ui-400)]'
                }`}
              >
                지원하기
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
