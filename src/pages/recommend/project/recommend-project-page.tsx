import { createBookmark, deleteBookmark, getBookmarks } from '@apis/bookmarks';
import { getRecommendProjects, type ProjectListItem } from '@apis/recommend';
import { useAuth } from '@clerk/clerk-react';
import ProjectListState from '@components/common/ListStateUI';
import ProjectFiltersBar from '@components/common/ProjectFilterBar';
import RecommendProjectCard from '@components/common/RecommendProjectCard';
import { buildParams } from '@mappers/projectFilters';
import { useFilterStore } from '@store/filter';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
          if (b.targetType !== 'PROJECT' || b.targetId == null) continue;
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

  const showReportCardOverlay =
    !loading &&
    !isError &&
    list.length === 0 &&
    projectTypes.length === 0 &&
    domains.length === 0 &&
    expectedPeriods.length === 0 &&
    techStacks.length === 0;

  if (showReportCardOverlay) {
    return (
      <div className="relative min-h-[calc(100vh-6rem)] w-full">
        <div className="pointer-events-none flex min-h-full select-none flex-col gap-6 blur-sm">
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
          <div className="flex flex-col gap-6" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex w-[520px] flex-col items-center gap-10 rounded-2xl border border-[var(--ui-200)] bg-[var(--ui-bg)] px-16 py-14 text-center shadow-none">
            <div className="flex flex-col items-center gap-3">
              <span className="whitespace-nowrap font-semibold text-[21px] text-[var(--ui-900)]">
                리포트를 생성하면 맞춤 추천을 받을 수 있어요
              </span>
              <span className="text-[15px] text-[var(--ui-500)]">
                나에게 맞는 추천 프로젝트를 받아 보세요
              </span>
            </div>
            <Link
              to="/report/create"
              className="inline-flex h-[52px] w-full max-w-[320px] items-center justify-center rounded-2xl bg-[#4E49FF] font-semibold text-[18px] text-white"
            >
              리포트 생성 페이지로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

        {!loading &&
          !isError &&
          list.length === 0 &&
          (projectTypes.length > 0 || domains.length > 0 || expectedPeriods.length > 0 || techStacks.length > 0) && (
            <p className="py-30 text-center text-2xl text-[var(--ui-500)]">
              선택하신 조건에 맞는 프로젝트가 없습니다.
            </p>
          )}

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
