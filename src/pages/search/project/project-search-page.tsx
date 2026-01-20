import ChevronDownIcon from '@assets/icons/chevron-down.svg?react';
import ProjectLg from '@components/common/ProjectLg';
import {
  PROJECT_FILTERS,
  PROJECT_LIST,
  PROJECT_ROLES,
  RECOMMENDED_PROJECTS,
} from 'src/mocks/project.mock';

export default function ProjectSearchPage() {
  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-10">
      {/* 추천 프로젝트 */}
      <header className="flex items-center justify-between">
        <h2 className="pl-2 font-semibold text-2xl text-color-card-title">
          추천 프로젝트 (UX라이팅 수정예정)
        </h2>

        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-2 text-card-muted text-lg hover:opacity-80"
        >
          더 많은 추천 프로젝트 보러가기 <span aria-hidden="true">›</span>
        </button>
      </header>

      <div className="h-px w-full bg-card-border" />

      {/* 필터 */}
      <div className="flex flex-wrap gap-4">
        {PROJECT_FILTERS.map((label) => (
          <button
            key={label}
            type="button"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-filter-bg px-5 py-3 font-medium text-filter-text text-xl"
          >
            {label}
            <ChevronDownIcon aria-hidden="true" className="h-4 w-4" />
          </button>
        ))}
      </div>

      {/* 프로젝트 리스트 */}
      <div className="flex flex-col gap-6">
        {PROJECT_LIST.map((p) => (
          <ProjectLg
            key={p.id}
            categoryLabel={p.categoryLabel}
            deadlineLabel={p.deadlineLabel}
            title={p.title}
            location={p.location}
            period={p.period}
            mode={p.mode}
            roles={[...PROJECT_ROLES]}
            dueLabel={p.dueLabel}
            bookmarked={p.bookmarked}
            onBookmarkChange={(next) => console.log('bookmark', p.id, next)}
            onClick={() => console.log('click project', p.id)}
          />
        ))}
      </div>
    </section>
  );
}
