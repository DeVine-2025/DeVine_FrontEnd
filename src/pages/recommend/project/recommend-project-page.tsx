import ChevronDownIcon from '@assets/icons/chevron-down.svg?react';
import RecommendProjectCard from '@components/common/RecommendProjectCard';
import DomainDropdown from '@components/recommend/DomainDropdown';
import ExpectedPeriodDropdown from '@components/recommend/ExpectedPeriodDropdown';
import PositionTechStackDropdown from '@components/recommend/PositionTechStackDropdown';
import ProjectTypeDropdown from '@components/recommend/ProjectTypeDropdown';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PROJECT_FILTERS,
  PROJECT_LIST,
  PROJECT_ROLES,
  type ProjectListItem,
} from 'src/mocks/recommendProject.mock';

const RecommendProjectPage = () => {
  const navigate = useNavigate();
  const [openFilter, setOpenFilter] = useState<null | (typeof PROJECT_FILTERS)[number]>(null);
  const [domains, setDomains] = useState<string[]>([]);
  const [expectedPeriods, setExpectedPeriods] = useState<string[]>([]);
  const [projectTypes, setProjectTypes] = useState<string[]>([]);
  const [techStacks, setTechStacks] = useState<string[]>([]);
  const handleProjectClick = (project: ProjectListItem) => {
    navigate(`/project/${project.id}`, { state: { project: { ...project, roles: PROJECT_ROLES } } });
  };

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-10">
      {/* 필터 */}
      <div className="flex flex-wrap gap-4">
        {PROJECT_FILTERS.map((label) => (
          <div key={label} className="relative">
            {(() => {
              const isProjectType = label === '프로젝트 유형';
              const isDomain = label === '도메인';
              const isExpectedPeriod = label === '예상 기간';
              const isTechStack = label === '포지션 / 기술스택';
              const values = isProjectType
                ? projectTypes
                : isDomain
                  ? domains
                  : isExpectedPeriod
                    ? expectedPeriods
                    : isTechStack
                      ? techStacks
                    : [];

              const isApplied = values.length > 0;
              const uniq = Array.from(new Set(values));
              const shown = uniq.slice(0, 2);
              const rest = Math.max(0, uniq.length - shown.length);
              const summary = `${shown.join(',')}${rest > 0 ? '…' : ''}`;
              const displayLabel = isApplied ? summary : label;

              return (
                <button
                  type="button"
                  onClick={() => setOpenFilter((prev) => (prev === label ? null : label))}
                  className={
                    isApplied
                      ? 'inline-flex max-w-[260px] cursor-pointer items-center gap-[10px] rounded-full border border-[var(--badge-bg-primary)] bg-[var(--badge-bg-primary)] px-5 py-[12px] font-semibold text-[var(--badge-text-primary)] text-xl'
                      : 'inline-flex max-w-[260px] cursor-pointer items-center gap-[10px] rounded-full border border-transparent bg-filter-bg px-5 py-[12px] font-semibold text-filter-text text-xl'
                  }
                >
                  <span className="truncate">{displayLabel}</span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className={
                      isApplied
                        ? 'h-[14px] w-[14px] text-[var(--badge-text-primary)]'
                        : 'h-[14px] w-[14px]'
                    }
                  />
                </button>
              );
            })()}

            {label === '프로젝트 유형' ? (
              <ProjectTypeDropdown
                open={openFilter === '프로젝트 유형'}
                value={projectTypes}
                onChange={setProjectTypes}
                onApply={() => console.log('apply projectTypes', projectTypes)}
                onReset={() => console.log('reset projectTypes')}
                onClose={() => setOpenFilter(null)}
              />
            ) : label === '도메인' ? (
              <DomainDropdown
                open={openFilter === '도메인'}
                value={domains}
                onChange={setDomains}
                onApply={() => console.log('apply domains', domains)}
                onReset={() => console.log('reset domains')}
                onClose={() => setOpenFilter(null)}
              />
            ) : label === '예상 기간' ? (
              <ExpectedPeriodDropdown
                open={openFilter === '예상 기간'}
                value={expectedPeriods}
                onChange={setExpectedPeriods}
                onApply={() => console.log('apply expectedPeriods', expectedPeriods)}
                onReset={() => console.log('reset expectedPeriods')}
                onClose={() => setOpenFilter(null)}
              />
            ) : label === '포지션 / 기술스택' ? (
              <PositionTechStackDropdown
                open={openFilter === '포지션 / 기술스택'}
                value={techStacks}
                onChange={setTechStacks}
                onApply={() => console.log('apply techStacks', techStacks)}
                onReset={() => console.log('reset techStacks')}
                onClose={() => setOpenFilter(null)}
              />
            ) : null}
          </div>
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
            onClick={() => handleProjectClick(p)}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendProjectPage;
