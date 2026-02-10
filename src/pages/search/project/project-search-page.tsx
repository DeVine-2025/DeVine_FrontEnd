import { createBookmark, deleteBookmark, getBookmarks } from '@apis/bookmarks';
import {
  getRecommendProjectsPreview,
  type RecommendProjectPreviewItem,
} from '@apis/mainrecommendproject';
import { useAuth } from '@clerk/clerk-react';
import ProjectListState from '@components/common/ListStateUI';
import Pagination from '@components/common/Pagination';
import ProjectFiltersBar, { type ProjectFilterKey } from '@components/common/ProjectFilterBar';
import ProjectLg from '@components/common/ProjectLg';
import ProjectSm from '@components/common/ProjectSm';
import { useProjectFilter } from '@hooks/useProjectFilters';
import { useProjects } from '@hooks/useProjects';
import { mapPositionsToRoles, mapProjectItemToCard, type ProjectCardModel } from '@mappers/project';
import { buildParams } from '@mappers/projectFilters';
import type { ProjectRole, RecommendPreviewItem } from '@t/project/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROJECT_FILTERS, PROJECT_ROLES, RECOMMENDED_PROJECTS } from 'src/mocks/project.mock';

// 북마크 하이드레이션: 새로고침/재진입 시에도 북마크 상태 유지
function useBookmarkHydration(getToken: () => Promise<string | null>, enabled: boolean) {
  const [bookmarkOverrides, setBookmarkOverrides] = useState<
    Record<number, { bookmarked: boolean; bookmarkId?: number }>
  >({});

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    (async () => {
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
    })();

    return () => {
      cancelled = true;
    };
  }, [getToken, enabled]);

  return { bookmarkOverrides, setBookmarkOverrides };
}

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
    page,
    setPage,
    resetFilter,
  } = useProjectFilter();

  // 북마크
  const { bookmarkOverrides, setBookmarkOverrides } = useBookmarkHydration(getToken, true);

  // 추천 프리뷰
  const [recommendedPreview, setRecommendedPreview] = useState<RecommendPreviewItem[]>(() =>
    RECOMMENDED_PROJECTS.map((project) => ({
      id: project.id,
      categoryLabel: project.categoryLabel,
      deadlineLabel: project.deadlineLabel,
      title: project.title,
      location: project.location,
      period: project.period,
      mode: project.mode,
      roles: [...PROJECT_ROLES],
    })),
  );

  const size = 10;

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setPage((prev) => (prev === 1 ? prev : 1));
  }, [projectTypes, domains, expectedPeriods, techStacks]);

  const params = useMemo(
    () => buildParams({ projectTypes, domains, expectedPeriods, techStacks, page, size }),
    [projectTypes, domains, expectedPeriods, techStacks, page],
  );

  const { data, isLoading, isError } = useProjects(params);
  const totalPages = data?.totalPages ?? 0;

  const projects = useMemo<ProjectCardModel[]>(() => {
    const mapped = data?.content?.map(mapProjectItemToCard) ?? [];
    return mapped.map((p: ProjectCardModel) => {
      const o = bookmarkOverrides[p.id];
      return o ? { ...p, ...o } : p;
    });
  }, [data, bookmarkOverrides]);

  // 북마크 토글
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
        } else {
          if (currentBookmarkId == null) return;
          await deleteBookmark(currentBookmarkId, token);
          setBookmarkOverrides((prev) => ({
            ...prev,
            [projectId]: { bookmarked: false, bookmarkId: undefined },
          }));
        }
      } catch (e) {
        console.error('[북마크]', e);
        alert(e instanceof Error ? e.message : '북마크 처리에 실패했습니다.');
      }
    },
    [getToken, setBookmarkOverrides],
  );

  // 추천 프리뷰 fetch
  useEffect(() => {
    let isActive = true;

    const fetchRecommendPreview = async () => {
      try {
        const token = await getToken();
        if (!token || !isActive) return;

        const result = await getRecommendProjectsPreview(4, token);
        if (!isActive) return;

        const mapped: RecommendPreviewItem[] = result.map((item: RecommendProjectPreviewItem) => ({
          id: String(item.projectId),
          categoryLabel: item.projectFieldName,
          deadlineLabel: item.categoryName,
          title: item.title,
          location: item.location,
          period: `${item.durationMonths}개월`,
          mode: item.modeName,
          roles: mapPositionsToRoles(item.positions as never),
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

  const ALL_FILTER_KEYS = [
    '프로젝트 유형',
    '도메인',
    '예상 기간',
    '포지션 / 기술스택',
  ] as const satisfies readonly ProjectFilterKey[];

  const handleRetry = () => {
    ALL_FILTER_KEYS.forEach(resetFilter);
  };

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
        {recommendedPreview.map((p) => {
          const ov = bookmarkOverrides[Number(p.id)];
          return (
            <ProjectSm
              key={p.id}
              categoryLabel={p.categoryLabel}
              deadlineLabel={p.deadlineLabel}
              title={p.title}
              location={p.location}
              period={p.period}
              mode={p.mode}
              roles={p.roles}
              bookmarked={ov?.bookmarked ?? false}
              onBookmarkChange={(next) => handleBookmarkChange(Number(p.id), next, ov?.bookmarkId)}
              onClick={() => handleProjectClick(p.id)}
            />
          );
        })}
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
        onApply={() => setOpenFilter(null)}
        onReset={(key) => resetFilter(key)}
      />

      {/* 프로젝트 리스트 */}
      <div className="flex flex-col gap-6">
        {isLoading && <ProjectListState type="loading" />}

        {!isLoading && isError && <ProjectListState type="error" onRetry={handleRetry} />}

        {!isLoading && !isError && projects.length === 0 && <ProjectListState type="empty" />}

        {!isLoading &&
          !isError &&
          projects.length > 0 &&
          projects.map((p) => (
            <ProjectLg
              key={p.id}
              {...p}
              onClick={() => handleProjectClick(p.id)}
              onBookmarkChange={(next) => handleBookmarkChange(p.id, next, p.bookmarkId)}
            />
          ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} className="mt-6" />
    </section>
  );
}
