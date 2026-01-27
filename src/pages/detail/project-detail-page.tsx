import { useLocation, useNavigate, useParams } from 'react-router-dom';
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

  const stateProject = (location.state as ProjectDetailState | null)?.project;
  const fallbackProject =
    PROJECT_LIST.find((project) => project.id === projectId) ??
    RECOMMENDED_PROJECTS.find((project) => project.id === projectId);

  const project = stateProject ?? (fallbackProject ? toProjectDetailInfo(fallbackProject) : undefined);
  if (!projectId || !project) {
    return <div>프로젝트 정보를 찾을 수 없습니다.</div>;
  }

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
              </div>
            </div>

            <div className="h-px w-full bg-card-border" />
          </div>

          <div className="flex flex-col gap-3 lg:mt-[230px] lg:items-end">
            <button
              type="button"
              className="inline-flex h-[44px] w-[240px] items-center justify-center gap-2 rounded-[12px] border border-[var(--contact-btn-border)] bg-[var(--contact-btn-bg)] px-6 text-[var(--contact-btn-text)] hover:opacity-80"
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
            <button
              type="button"
              className="h-[44px] w-[240px] rounded-[12px] bg-[var(--badge-text-primary)] px-6 font-semibold text-white hover:opacity-80"
            >
              지원하기
            </button>
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
                  {project.deadlineLabel ?? '금융'}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="min-w-[84px] text-base">진행 장소</span>
                <span className="text-base font-semibold text-card-title">
                  {project.location ?? '서울 강남구'}
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
                  {project.period ?? '1개월'}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="min-w-[84px] text-base">모집 마감일</span>
                <span className="text-base font-semibold text-card-title">
                  {project.dueLabel ?? '26.01.08'}
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
                    className="inline-flex items-center rounded-full border border-[var(--tech-chip-border)] bg-[var(--tech-chip-bg)] px-3 py-1 text-sm text-[var(--ui-800)]"
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
                    className="inline-flex items-center rounded-full border border-[var(--tech-chip-border)] bg-[var(--tech-chip-bg)] px-3 py-1 text-sm text-[var(--ui-800)]"
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
                    className="inline-flex items-center rounded-full border border-[var(--tech-chip-border)] bg-[var(--tech-chip-bg)] px-3 py-1 text-sm text-[var(--ui-800)]"
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
    </section>
  );
};

export default ProjectDetailPage;
