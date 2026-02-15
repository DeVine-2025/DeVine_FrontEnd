import { createBookmark, deleteBookmark } from '@apis/bookmarks';
import { getRecommendProjects, type ProjectListItem } from '@apis/recommend';
import { reportQueries } from '@apis/report/report-queries';
import { useAuth } from '@clerk/clerk-react';
import ProjectListState from '@components/common/ListStateUI';
import ProjectFiltersBar from '@components/common/ProjectFilterBar';
import RecommendProjectCard from '@components/common/RecommendProjectCard';
import { useBookmarks } from '@hooks/useBookmarks';
import { buildParams } from '@mappers/projectFilters';
import { useFilterStore } from '@store/filter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReportRequiredCard from '@components/common/ReportRequiredCard';
import { useNavigate } from 'react-router-dom';
import { PROJECT_FILTERS } from '@components/common/ProjectFilterBar';

const RecommendProjectPage = () => {
  const { getToken, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { recommendProject, setRecommendProject } = useFilterStore();
  const { domains, expectedPeriods, projectTypes, techStacks } = recommendProject;

  const { data: reportsData, isFetched: reportsFetched } = useQuery({
    ...reportQueries.report(),
    enabled: !!isSignedIn,
    staleTime: 60_000,
  });
  const hasReport = (reportsData?.result?.reports?.length ?? 0) > 0;

  const { data: bookmarks = [] } = useBookmarks();
  const bookmarkMap = useMemo(() => {
    const map: Record<number, number> = {};
    for (const b of bookmarks) {
      if (b.targetType === 'PROJECT' && b.targetId != null) map[b.targetId] = b.bookmarkId;
    }
    return map;
  }, [bookmarks]);
  const bookmarkMapRef = useRef(bookmarkMap);
  bookmarkMapRef.current = bookmarkMap;

  const [openFilter, setOpenFilter] = useState<null | (typeof PROJECT_FILTERS)[number]>(null);
  const [list, setList] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [page, setPage] = useState(1);

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

  const displayList = useMemo(
    () =>
      list.map((p) => ({
        ...p,
        bookmarked: !!bookmarkMap[Number(p.id)],
        bookmarkId: bookmarkMap[Number(p.id)],
      })),
    [list, bookmarkMap],
  );

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

  const handleNavigateToProject = useCallback(
    (id: string) => navigate(`/project/${id}`),
    [navigate],
  );

  const handleBookmarkChange = useCallback(
    async (projectId: string, next: boolean, currentBookmarkId?: number) => {
      const token = await getToken();
      if (!token) return;
      const targetId = Number(projectId);
      if (Number.isNaN(targetId)) return;

      try {
        if (next) {
          await createBookmark({ targetType: 'PROJECT', targetId }, token);
        } else {
          if (currentBookmarkId == null) return;
          await deleteBookmark(currentBookmarkId, token);
        }
        await queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      } catch (e) {
        console.error('[북마크]', e);
        alert(e instanceof Error ? e.message : '북마크 처리에 실패했습니다.');
      }
    },
    [getToken, queryClient],
  );

  const handleRetry = useCallback(() => {
    setPage(1);
    fetchList();
  }, [fetchList]);

  const handleApply = useCallback(() => {
    setOpenFilter(null);
    setPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setOpenFilter(null);
    setPage(1);
  }, []);

  const showReportCardOverlay = !!isSignedIn && reportsFetched && !hasReport;

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
            <ReportRequiredCard
              title="리포트를 등록하면 맞춤 추천을 받을 수 있어요"
              description="나에게 맞는 추천 프로젝트를 받아 보세요"
              linkLabel="리포트 등록하러 가기"
              linkTo="/report/create"
            />
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
          displayList.length > 0 &&
          displayList.map((p) => (
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
              roles={[]}
              dueLabel={p.dueLabel}
              bookmarked={p.bookmarked ?? false}
              techstackScorePercent={p.techstackScorePercent}
              similarityScorePercent={p.similarityScorePercent}
              domainMatch={p.domainMatch}
              totalScore={p.totalScore}
              projectId={p.id}
              bookmarkId={p.bookmarkId}
              onBookmarkChangeById={handleBookmarkChange}
              onNavigateToProject={handleNavigateToProject}
            />
          ))}
      </div>
    </div>
  );
};

export default RecommendProjectPage;
