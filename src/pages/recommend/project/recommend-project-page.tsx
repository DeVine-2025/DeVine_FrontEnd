import ChevronDownIcon from '@assets/icons/chevron-down.svg?react';
import RecommendProjectCard from '@components/common/RecommendProjectCard';
import {
  PROJECT_FILTERS,
  PROJECT_LIST,
  PROJECT_ROLES,
} from 'src/mocks/project.mock';

const RecommendProjectPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-10">
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
          <RecommendProjectCard
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
            techSuitability={p.techSuitability}
            domainSuitability={p.domainSuitability}
            growthPotential={p.growthPotential}
            overallScore={p.overallScore}
            onBookmarkChange={(next) => console.log('bookmark', p.id, next)}
            onClick={() => console.log('click project', p.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendProjectPage;
