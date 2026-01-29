import ProjectFiltersBar from '@components/common/ProjectFilterBar';
import RecommendProjectCard from '@components/common/RecommendProjectCard';
import { useState } from 'react';
import { PROJECT_FILTERS, PROJECT_LIST, PROJECT_ROLES } from 'src/mocks/recommendProject.mock';

const RecommendProjectPage = () => {
  const [openFilter, setOpenFilter] = useState<null | (typeof PROJECT_FILTERS)[number]>(null);
  const [domains, setDomains] = useState<string[]>([]);
  const [expectedPeriods, setExpectedPeriods] = useState<string[]>([]);
  const [projectTypes, setProjectTypes] = useState<string[]>([]);
  const [techStacks, setTechStacks] = useState<string[]>([]);

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-10">
      {/* 필터 */}
      <ProjectFiltersBar
        filters={PROJECT_FILTERS}
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
        projectTypes={projectTypes}
        setProjectTypes={setProjectTypes}
        domains={domains}
        setDomains={setDomains}
        expectedPeriods={expectedPeriods}
        setExpectedPeriods={setExpectedPeriods}
        techStacks={techStacks}
        setTechStacks={setTechStacks}
        onApply={(key) => console.log('apply', key)}
        onReset={(key) => console.log('reset', key)}
      />

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
