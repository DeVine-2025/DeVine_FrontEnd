import { createBookmark, deleteBookmark, getBookmarks } from '@apis/bookmarks';
import { getRecommendProjects, type ProjectListItem } from '@apis/recommend';
import { useAuth } from '@clerk/clerk-react';
import ProjectListState from '@components/common/ListStateUI';
import Pagination from '@components/common/Pagination';
import ProjectFiltersBar from '@components/common/ProjectFilterBar';
import RecommendProjectCard from '@components/common/RecommendProjectCard';
import { buildParams } from '@mappers/projectFilters';
import { useFilterStore } from '@store/filter';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROJECT_FILTERS, PROJECT_ROLES } from 'src/mocks/recommendProject.mock';

const RecommendProjectPage = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { recommendProject, setRecommendProject } = useFilterStore();
  const { domains, expectedPeriods, projectTypes, techStacks } = recommendProject;

  const [openFilter, setOpenFilter] = useState<null | (typeof PROJECT_FILTERS)[number]>(null);
  const [list, setList] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [bookmarkMap, setBookmarkMap] = useState<Record<number, number>>({});

  const params = useMemo(
    () =>
      buildParams({
        projectTypes,
        domains,
        expectedPeriods,
        techStacks,
        page,
        size: 10,
      }),
    [projectTypes, domains, expectedPeriods, techStacks, page],
  );

  // 새로고침 시에도 북마크가 칠해져 보이도록: 내 북마크 목록을 먼저 로드
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getToken();
      if (!token || cancelled) return;

      try {
        const bookmarks = await getBookmarks(token);
        if (cancelled) return;

        const next: Record<number, number> = {};
        for (const b of bookmarks) {
          if (b.targetType !== 'PROJECT') continue;
          next[b.targetId] = b.bookmarkId;
        }
        setBookmarkMap(next);
      } catch (e) {
        console.error('[북마크] 목록 로드 실패', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const fetchList = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setList([]);
      setTotalPages(0);
      setLoading(false);
      setIsError(false);
      return;
    }

    setLoading(true);
    setIsError(false);

    try {
      const result = await getRecommendProjects(token, params);

      setList(
        result.list.map((p: ProjectListItem) => {
          const hit = bookmarkMap[Number(p.id)];
          return hit ? { ...p, bookmarked: true, bookmarkId: hit } : p;
        }),
      );
      setTotalPages(result.totalPages);
    } catch (e) {
      console.error('[추천 프로젝트]', e);
      setIsError(true);
      setList([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [getToken, params, bookmarkMap]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // 북마크 목록이 늦게 로드된 경우에도 현재 리스트에 반영
  useEffect(() => {
    setList((prev) =>
      prev.map((p) => {
        const hit = bookmarkMap[Number(p.id)];
        return hit ? { ...p, bookmarked: true, bookmarkId: hit } : p;
      }),
    );
  }, [bookmarkMap]);

  const handleProjectClick = (project: ProjectListItem) => {
    navigate(`/project/${project.id}`);
  };

  const handleBookmarkChange = useCallback(
    async (projectId: string, next: boolean, currentBookmarkId?: number) => {
      const token = await getToken();
      if (!token) return;
      const targetId = Number(projectId);
      if (Number.isNaN(targetId)) return;
      try {
        if (next) {
          const { bookmarkId } = await createBookmark({ targetType: 'PROJECT', targetId }, token);
          setBookmarkMap((prev) => ({ ...prev, [targetId]: bookmarkId }));
          setList((prev) =>
            prev.map((p) => (p.id === projectId ? { ...p, bookmarked: true, bookmarkId } : p)),
          );
        } else {
          if (currentBookmarkId == null) return;
          await deleteBookmark(currentBookmarkId, token);
          setBookmarkMap((prev) => {
            const nextMap = { ...prev };
            delete nextMap[targetId];
            return nextMap;
          });
          setList((prev) =>
            prev.map((p) =>
              p.id === projectId ? { ...p, bookmarked: false, bookmarkId: undefined } : p,
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

  const handleRetry = useCallback(() => {
    setPage(1);
  }, []);

  const setDomains = useCallback(
    (v: string[]) => setRecommendProject({ domains: v }),
    [setRecommendProject],
  );
  const setExpectedPeriods = useCallback(
    (v: string[]) => setRecommendProject({ expectedPeriods: v }),
    [setRecommendProject],
  );
  const setProjectTypes = useCallback(
    (v: string[]) => setRecommendProject({ projectTypes: v }),
    [setRecommendProject],
  );
  const setTechStacks = useCallback(
    (v: string[]) => setRecommendProject({ techStacks: v }),
    [setRecommendProject],
  );

  const handleApply = useCallback(() => {
    setOpenFilter(null);
    setPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setOpenFilter(null);
    setPage(1);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-10">
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
        onApply={handleApply}
        onReset={handleReset}
      />

      <div className="flex flex-col gap-6">
        {loading && <ProjectListState type="loading" />}

        {!loading && isError && <ProjectListState type="error" onRetry={handleRetry} />}

        {!loading && !isError && list.length === 0 && <ProjectListState type="empty" />}

        {!loading &&
          !isError &&
          list.length > 0 &&
          list.map((p) => (
            <RecommendProjectCard
              key={p.id}
              categoryLabel={p.categoryLabel}
              deadlineLabel={p.deadlineLabel}
              title={p.title}
              thumbnailUrl={p.thumbnailUrl}
              thumbnailAlt={p.title}
              location={p.location}
              period={p.period}
              mode={p.mode}
              roles={[...PROJECT_ROLES]}
              dueLabel={p.dueLabel}
              bookmarked={p.bookmarked ?? false}
              techSuitability={p.techSuitability}
              domainSuitability={p.domainSuitability}
              growthPotential={p.growthPotential}
              overallScore={p.overallScore}
              onBookmarkChange={(next) => handleBookmarkChange(p.id, next, p.bookmarkId)}
              onClick={() => handleProjectClick(p)}
            />
          ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} className="mt-6" />
    </div>
  );
};

export default RecommendProjectPage;
