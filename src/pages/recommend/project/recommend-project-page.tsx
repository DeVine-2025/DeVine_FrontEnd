import { createBookmark, deleteBookmark, getBookmarks } from '@apis/bookmarks';
import { getRecommendProjects, type ProjectListItem } from '@apis/recommend';
import { useAuth } from '@clerk/clerk-react';
import ProjectListState from '@components/common/ListStateUI';
import ProjectFiltersBar from '@components/common/ProjectFilterBar';
import RecommendProjectCard from '@components/common/RecommendProjectCard';
import { buildParams } from '@mappers/projectFilters';
import { useFilterStore } from '@store/filter';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const [bookmarkMap, setBookmarkMap] = useState<Record<number, number>>({});

  const bookmarkMapRef = useRef<Record<number, number>>({});

  useEffect(() => {
    bookmarkMapRef.current = bookmarkMap;
  }, [bookmarkMap]);

  const params = useMemo(
    () =>
      buildParams({
        projectTypes,
        domains,
        expectedPeriods,
        techStacks,
      }),
    [projectTypes, domains, expectedPeriods, techStacks],
  );

  // 북마크 목록 로드 후 list에 한 번만 병합
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

        setList((prev) =>
          prev.map((p) => {
            const hit = next[Number(p.id)];
            return hit ? { ...p, bookmarked: true, bookmarkId: hit } : p;
          }),
        );
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
      setLoading(false);
      setIsError(false);
      return;
    }

    setLoading(true);
    setIsError(false);

    try {
      const result = await getRecommendProjects(token, params);

      const map = bookmarkMapRef.current;

      setList(
        result.list.map((p: ProjectListItem) => {
          const hit = map[Number(p.id)];
          return hit ? { ...p, bookmarked: true, bookmarkId: hit } : p;
        }),
      );
    } catch (e) {
      console.error('[추천 프로젝트]', e);
      setIsError(true);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [getToken, params]);

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

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleProjectClick = (project: ProjectListItem) => {
    navigate(`/project/${project.id}`);
  };

  const handleBookmarkChange = useCallback(
    async (projectId: string, next: boolean, currentBookmarkId?: number) => {
      const token = await getToken();
      if (!token) return;
      const targetId = Number(projectId);
      if (Number.isNaN(targetId)) return;

      // 낙관적 UI: 먼저 UI 반영 (placeholder -1 사용, 0은 effect에서 falsy로 롤백되므로)
      const prevMap = bookmarkMapRef.current;
      const prevBookmarkId = prevMap[targetId];
      if (next) {
        setBookmarkMap((prev) => ({ ...prev, [targetId]: -1 }));
        setList((prev) =>
          prev.map((p) =>
            p.id === projectId ? { ...p, bookmarked: true, bookmarkId: undefined } : p,
          ),
        );
      } else {
        if (currentBookmarkId == null) return;
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
        }
      } catch (e) {
        console.error('[북마크]', e);
        // 실패 시 롤백
        if (next) {
          setBookmarkMap((prev) => {
            const nextMap = { ...prev };
            delete nextMap[targetId];
            return nextMap;
          });
          setList((prev) =>
            prev.map((p) =>
              p.id === projectId ? { ...p, bookmarked: false, bookmarkId: prevBookmarkId } : p,
            ),
          );
        } else {
          setBookmarkMap((prev) => ({ ...prev, [targetId]: currentBookmarkId! }));
          setList((prev) =>
            prev.map((p) =>
              p.id === projectId ? { ...p, bookmarked: true, bookmarkId: currentBookmarkId } : p,
            ),
          );
        }
        alert(e instanceof Error ? e.message : '북마크 처리에 실패했습니다.');
      }
    },
    [getToken],
  );

  const handleRetry = useCallback(() => {
    setPage(1);
  }, []);

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
              techstackScorePercent={p.techstackScorePercent}
              similarityScorePercent={p.similarityScorePercent}
              domainMatch={p.domainMatch}
              totalScore={p.totalScore}
              projectId={p.id}
              bookmarkId={p.bookmarkId}
              onBookmarkChangeById={handleBookmarkChange}
              onClick={() => handleProjectClick(p)}
            />
          ))}
      </div>
    </div>
  );
};

export default RecommendProjectPage;
