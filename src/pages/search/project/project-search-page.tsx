<<<<<<< HEAD
import { createBookmark, deleteBookmark } from '@apis/bookmarks';
import { getRecommendProjectsPreview, type RecommendProjectPreviewItem } from '@apis/mainrecommendproject';
=======
import {
  getRecommendProjectsPreview,
  type RecommendProjectPreviewItem,
} from '@apis/mainrecommendproject';
import { useAuth } from '@clerk/clerk-react';
>>>>>>> origin/develope
import Pagination from '@components/common/Pagination';
import ProjectFiltersBar from '@components/common/ProjectFilterBar';
import ProjectLg from '@components/common/ProjectLg';
import ProjectSm from '@components/common/ProjectSm';
import { useProjectFilter } from '@hooks/useProjectFilters';
import { useProjects } from '@hooks/useProjects';
import { mapPositionsToRoles, mapProjectItemToCard, type ProjectCardModel } from '@mappers/project';
import { buildParams } from '@mappers/projectFilters';
import type { ProjectRole } from '@t/project/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROJECT_FILTERS, PROJECT_ROLES, RECOMMENDED_PROJECTS } from 'src/mocks/project.mock';
import { getBookmarks } from '@apis/bookmarks';

export default function ProjectSearchPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const handleProjectClick = (
    projectId: number | string,
    payload?: {
      id: string;
      categoryLabel?: string;
      deadlineLabel?: string;
      title: string;
      location?: string;
      period?: string;
      mode?: string;
      dueLabel?: string;
      roles?: ProjectRole[];
    },
  ) => {
    if (payload) {
      try {
        sessionStorage.setItem(`project_detail_${projectId}`, JSON.stringify(payload));
      } catch {
        // ignore storage errors
      }
    }
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
  type RecommendPreviewItem = {
    id: string;
    categoryLabel: string;
    deadlineLabel: string;
    title: string;
    location: string;
    period: string;
    mode: string;
    roles: ProjectRole[];
    bookmarked?: boolean;
    bookmarkId?: number;
  };

  const [recommendedPreview, setRecommendedPreview] = useState<RecommendPreviewItem[]>(
    RECOMMENDED_PROJECTS.map((project) => ({
      id: project.id,
      categoryLabel: project.categoryLabel,
      deadlineLabel: project.deadlineLabel,
      title: project.title,
      location: project.location,
      period: project.period,
      mode: project.mode,
      roles: [...PROJECT_ROLES],
      bookmarked: false,
      bookmarkId: undefined,
    })),
  );

  const size = 10;
  const params = useMemo(() => buildParams({ ...applied, page, size }), [applied, page]); // console.log('params', params);

  const { data, isLoading, isError, error } = useProjects(params);
  const [bookmarkOverrides, setBookmarkOverrides] = useState<
    Record<number, { bookmarked: boolean; bookmarkId?: number }>
  >({});
  const [projects, setProjects] = useState<ProjectCardModel[]>([]);
  const totalPages = data?.totalPages ?? 0;

  // console.log('project', projects);
  useEffect(() => {
    const mapped = data?.content?.map(mapProjectItemToCard) ?? [];
    setProjects(
      mapped.map((p) => {
        const o = bookmarkOverrides[p.id];
        return o ? { ...p, ...o } : p;
      }),
    );
  }, [data, bookmarkOverrides]);

  // 새로고침 시에도 북마크 상태가 유지되도록: 최초 로드에 내 북마크 목록을 하이드레이션
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const token = await getToken();
      if (!token || cancelled) return;
      try {
        const bookmarks = await getBookmarks(token);
        if (cancelled) return;
        const next: Record<number, { bookmarked: boolean; bookmarkId?: number }> = {};
        for (const b of bookmarks) {
          if (b.targetType !== 'PROJECT') continue;
          next[b.targetId] = { bookmarked: true, bookmarkId: b.bookmarkId };
        }
        setBookmarkOverrides(next);
      } catch (e) {
        console.error('[북마크] 목록 로드 실패', e);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const handleBookmarkChange = useCallback(
    async (projectId: number, next: boolean, currentBookmarkId?: number) => {
      const token = await getToken();
      if (!token) return;
      try {
        if (next) {
          const { bookmarkId } = await createBookmark(
            { targetType: 'PROJECT', targetId: projectId },
            token,
          );
          setBookmarkOverrides((prev) => ({
            ...prev,
            [projectId]: { bookmarked: true, bookmarkId },
          }));
          setProjects((prev) =>
            prev.map((p) => (p.id === projectId ? { ...p, bookmarked: true, bookmarkId } : p)),
          );
          setRecommendedPreview((prev) =>
            prev.map((p) =>
              p.id === String(projectId) ? { ...p, bookmarked: true, bookmarkId } : p,
            ),
          );
        } else {
          if (currentBookmarkId == null) return;
          await deleteBookmark(currentBookmarkId, token);
          setBookmarkOverrides((prev) => ({
            ...prev,
            [projectId]: { bookmarked: false, bookmarkId: undefined },
          }));
          setProjects((prev) =>
            prev.map((p) =>
              p.id === projectId ? { ...p, bookmarked: false, bookmarkId: undefined } : p,
            ),
          );
          setRecommendedPreview((prev) =>
            prev.map((p) =>
              p.id === String(projectId)
                ? { ...p, bookmarked: false, bookmarkId: undefined }
                : p,
            ),
          );
        }
      } catch (e) {
        console.error('[북마크]', e);
        alert(e instanceof Error ? e.message : '북마크 처리에 실패했습니다.');
      }
    },
    [getToken],
  );

  useEffect(() => {
    let isActive = true;

    const fetchRecommendPreview = async () => {
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
          location: item.location,
          period: `${item.durationMonths}개월`,
          mode: item.modeName,
          roles: mapPositionsToRoles(item.positions as never),
          bookmarked: false,
          bookmarkId: undefined,
        }));
        setRecommendedPreview(mapped);
      } catch {
        if (isActive) {
          setRecommendedPreview(
            RECOMMENDED_PROJECTS.map((project) => ({
              id: project.id,
              categoryLabel: project.categoryLabel,
              deadlineLabel: project.deadlineLabel,
              title: project.title,
              location: project.location,
              period: project.period,
              mode: project.mode,
              roles: [...PROJECT_ROLES],
              bookmarked: false,
              bookmarkId: undefined,
            })),
          );
        }
      }
    };

    void fetchRecommendPreview();
    return () => {
      isActive = false;
    };
  }, [getToken]);

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
        {recommendedPreview.map((p) => (
          <ProjectSm
            key={p.id}
            categoryLabel={p.categoryLabel}
            deadlineLabel={p.deadlineLabel}
            title={p.title}
            location={p.location}
            period={p.period}
            mode={p.mode}
            roles={p.roles}
<<<<<<< HEAD
            bookmarked={bookmarkOverrides[Number(p.id)]?.bookmarked ?? (p.bookmarked ?? false)}
            onBookmarkChange={(next) =>
              handleBookmarkChange(
                Number(p.id),
                next,
                bookmarkOverrides[Number(p.id)]?.bookmarkId ?? p.bookmarkId,
              )
            }
            onClick={() => handleProjectClick(p.id)}
=======
            bookmarked={false}
            onClick={() =>
              handleProjectClick(p.id, {
                id: String(p.id),
                categoryLabel: p.categoryLabel,
                deadlineLabel: p.deadlineLabel,
                title: p.title,
                location: p.location,
                period: p.period,
                mode: p.mode,
                roles: p.roles,
              })
            }
>>>>>>> origin/develope
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
<<<<<<< HEAD
            onClick={() => handleProjectClick(p.id)}
            onBookmarkChange={(next) => handleBookmarkChange(p.id, next, p.bookmarkId)}
=======
            onClick={() =>
              handleProjectClick(p.id, {
                id: String(p.id),
                categoryLabel: p.categoryLabel,
                deadlineLabel: p.deadlineLabel,
                title: p.title,
                location: p.location,
                period: p.period,
                mode: p.mode,
                dueLabel: p.dueLabel,
                roles: p.roles,
              })
            }
            onBookmarkChange={(next) => console.log('bookmark', p.id, next)}
>>>>>>> origin/develope
          />
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} className="mt-6" />
    </section>
  );
}
