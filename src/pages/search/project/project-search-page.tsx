import Pagination from '@components/common/Pagination';
import ProjectFiltersBar from '@components/common/ProjectFilterBar';
import ProjectLg from '@components/common/ProjectLg';
import ProjectSm from '@components/common/ProjectSm';
import { useProjectFilter } from '@hooks/useProjectFilters';
import { useProjects } from '@hooks/useProjects';
import { mapProjectItemToCard, type ProjectCardModel } from '@mappers/project';
import { buildParams } from '@mappers/projectFilters';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROJECT_FILTERS, PROJECT_ROLES, RECOMMENDED_PROJECTS } from 'src/mocks/project.mock';

export default function ProjectSearchPage() {
  const navigate = useNavigate();
  const handleProjectClick = (projectId: number | string) => {
    navigate(`/project/${projectId}`);
  };

  const {
    openFilter,
    setOpenFilter,
    projectTypes,
    setProjectTypes,
    domains,
    setDomains,
    expectedPeriods,
    setExpectedPeriods,
    techStacks,
    setTechStacks,
    applied,
    page,
    setPage,
    applyFilters,
    resetFilter,
  } = useProjectFilter();

  const size = 10;
  const params = useMemo(() => buildParams({ ...applied, page, size }), [applied, page]);
  // console.log('params', params);

  const { data, isLoading, isError, error } = useProjects(params);
  const projects: ProjectCardModel[] = data?.content?.map(mapProjectItemToCard) ?? [];
  const totalPages = data?.totalPages ?? 0;

  // console.log('project', projects);

  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-10">
      {/* 추천 프로젝트 */}
      <header className="flex items-center justify-between">
        <h2 className="pl-5 font-semibold text-[16px] text-card-title">추천 프로젝트</h2>

        <button
          type="button"
          onClick={() => navigate('/recommend')}
          className="inline-flex cursor-pointer items-center gap-2 font-medium text-card-muted text-xl hover:opacity-80"
        >
          더 많은 추천 프로젝트 보러가기
          <span aria-hidden="true" className="text-3xl leading-none">
            ›
          </span>
        </button>
      </header>

      <div className="scrollbar-hide flex justify-between gap-6 overflow-x-auto">
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
            onClick={() => handleProjectClick(p.id)}
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
        onApply={() => applyFilters()}
        onReset={(key) => resetFilter(key)}
      />

      {/* 프로젝트 리스트 */}
      <div className="flex flex-col gap-6">
        {projects.map((p) => (
          <ProjectLg
            key={p.id}
            {...p}
            onClick={() => handleProjectClick(p.id)}
            onBookmarkChange={(next) => console.log('bookmark', p.id, next)}
          />
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} className="mt-6" />
    </section>
  );
}
