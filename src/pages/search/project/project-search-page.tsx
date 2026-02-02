import ProjectFiltersBar from '@components/common/ProjectFilterBar';
import ProjectLg from '@components/common/ProjectLg';
import ProjectSm from '@components/common/ProjectSm';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PROJECT_FILTERS,
  PROJECT_LIST,
  PROJECT_ROLES,
  RECOMMENDED_PROJECTS,
} from 'src/mocks/project.mock';
import type { ProjectListItem, RecommendedProject } from 'src/mocks/project.mock';

export default function ProjectSearchPage() {
  const navigate = useNavigate();
  const handleProjectClick = (project: RecommendedProject | ProjectListItem) => {
    navigate(`/project/${project.id}`, { state: { project: { ...project, roles: PROJECT_ROLES } } });
  };

  const [openFilter, setOpenFilter] = useState<null | (typeof PROJECT_FILTERS)[number]>(null);
  const [domains, setDomains] = useState<string[]>([]);
  const [expectedPeriods, setExpectedPeriods] = useState<string[]>([]);
  const [projectTypes, setProjectTypes] = useState<string[]>([]);
  const [techStacks, setTechStacks] = useState<string[]>([]);

  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-10">
      {/* 추천 프로젝트 */}
      <header className="flex items-center justify-between">
        <h2 className="pl-5 font-semibold text-[16px] text-card-title">
          추천 프로젝트 (UX라이팅 수정예정)
        </h2>

        <button
          type="button"
          onClick={() => navigate('/recommend')}
          className="inline-flex cursor-pointer items-center gap-2 text-card-muted text-lg hover:opacity-80"
        >
          더 많은 추천 프로젝트 보러가기 <span aria-hidden="true">›</span>
        </button>
      </header>

      <div className="scrollbar-hide flex justify-center gap-6 overflow-x-auto">
        {RECOMMENDED_PROJECTS.map((p) => (
          <ProjectSm
            key={p.id}
            categoryLabel={p.categoryLabel}
            deadlineLabel={p.deadlineLabel}
            title={p.title}
            location={p.location}
            period={p.period}
            mode={p.mode}
            roles={[...PROJECT_ROLES]}
            bookmarked={p.bookmarked}
            onClick={() => handleProjectClick(p)}
          />
        ))}
      </div>

      <div className="h-px w-full bg-card-border" />

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
            onClick={() => handleProjectClick(p)}
          />
        ))}
      </div>
    </section>
  );
}
