import { createBookmark, deleteBookmark } from '@apis/bookmarks';
import { getRecommendMembers, type GetRecommendMembersParams, type RecommendDeveloperListItem } from '@apis/members';
import { useAuth } from '@clerk/clerk-react';
import DeveloperFilterBar, { type DeveloperFilterKey } from '@components/common/DeveloperFilterBar';
import LoadingSpinner from '@components/common/LoadingSpinner';
import RecommendDeveloperCard from '@components/common/RecommendDeveloperCard';
import ReportRequiredCard from '@components/common/ReportRequiredCard';
import { useBookmarks } from '@hooks/useBookmarks';
import { useMyRecruitingProjects } from '@hooks/useMyRecruitingProjects';
import { useFilterStore } from '@store/filter';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RECOMMEND_DEVELOPER_FILTERS = ['내 프로젝트 선택'] as const;

type MyProjectOption = { id: number; name: string };
const MY_PROJECTS_CACHE_KEY = 'devine_my_projects_cache_v1';

function writeMyProjectsCache(options: MyProjectOption[]) {
  try {
    localStorage.setItem(MY_PROJECTS_CACHE_KEY, JSON.stringify(options));
  } catch {}
}

function buildApiParams(
  selectedProjectNames: string[],
  page: number,
  myProjectOptions: MyProjectOption[],
): GetRecommendMembersParams | null {
  const projectIds = selectedProjectNames
    .map((name) => myProjectOptions.find((p) => p.name === name)?.id)
    .filter((id): id is number => typeof id === 'number' && id > 0);

  if (projectIds.length === 0) return null;

  return { projectId: projectIds[0], projectIds, page, size: 10 };
}

function projectsToOptions(projects: { projectId: number; title: string }[]): MyProjectOption[] {
  const uniqById = Array.from(new Map(projects.map((p) => [p.projectId, p])).values());
  const seenCounts: Record<string, number> = {};
  return uniqById.map((p) => {
    const base = (p.title ?? '').trim() || `프로젝트 ${p.projectId}`;
    seenCounts[base] = (seenCounts[base] ?? 0) + 1;
    const n = seenCounts[base];
    const label = n > 1 ? `${base} (${n})` : base;
    return { id: p.projectId, name: label };
  });
}

const RecommendDeveloperPage = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    recommendDeveloper,
    setRecommendDeveloper,
  } = useFilterStore();
  const { myProjects, interestDomains, techStacks } = recommendDeveloper;

  const { data: bookmarks = [] } = useBookmarks();
  const bookmarkMap = useMemo(() => {
    const map: Record<string | number, number> = {};
    for (const b of bookmarks) {
      if (b.targetType !== 'DEVELOPER') continue;
      const key = b.targetNickname ?? b.targetId;
      if (key !== undefined && key !== null) map[key] = b.bookmarkId;
    }
    return map;
  }, [bookmarks]);
  const bookmarkMapRef = useRef(bookmarkMap);
  bookmarkMapRef.current = bookmarkMap;

  const { data: projectsData, isLoading: myProjectOptionsLoading } = useMyRecruitingProjects();
  const myProjectOptions = useMemo(
    () => (projectsData ? projectsToOptions(projectsData) : []),
    [projectsData],
  );
  useEffect(() => {
    if (myProjectOptions.length > 0) writeMyProjectsCache(myProjectOptions);
  }, [myProjectOptions]);

  const [openFilter, setOpenFilter] = useState<DeveloperFilterKey | null>(null);
  const [autoSelectProject, setAutoSelectProject] = useState(true);
  const [list, setList] = useState<RecommendDeveloperListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const listRef = useRef<RecommendDeveloperListItem[]>([]);
  listRef.current = list;

  const setMyProjects = useCallback(
    (v: string[] | ((prev: string[]) => string[])) => {
      const next = typeof v === 'function' ? v(myProjects) : v;
      if (next.length > 0) setAutoSelectProject(true);
      setRecommendDeveloper({ myProjects: next });
    },
    [myProjects, setRecommendDeveloper],
  );
  const setInterestDomains = useCallback(
    (v: string[]) => setRecommendDeveloper({ interestDomains: v }),
    [setRecommendDeveloper],
  );
  const setTechStacks = useCallback(
    (v: string[]) => setRecommendDeveloper({ techStacks: v }),
    [setRecommendDeveloper],
  );

  useEffect(() => {
    if (!autoSelectProject) return;
    if (myProjectOptionsLoading) return;
    if (myProjectOptions.length === 0) return;
    if (myProjects.length > 0) return;
    const mostRecentName = myProjectOptions[0].name;
    setRecommendDeveloper({ myProjects: [mostRecentName] });
    setPage(1);
  }, [autoSelectProject, myProjectOptionsLoading, myProjectOptions, myProjects.length, setRecommendDeveloper]);

  useEffect(() => {
    if (myProjectOptionsLoading) return;
    if (myProjectOptions.length === 0) return;
    setPage(1);
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myProjects]);

  const fetchList = useCallback(
    async (pageNum: number = 1) => {
      const token = await getToken();
      if (!token) {
        setList([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const params = buildApiParams(myProjects, pageNum, myProjectOptions);
        if (!params) {
          setList([]);
          setTotalPages(0);
          setLoading(false);
          return;
        }
        const result = await getRecommendMembers(token, params);
        const map = bookmarkMapRef.current;
        setList(
          result.list.map((d) => {
            const key = d.memberId ?? d.nickname;
            const hit = map[key];
            if (hit === undefined || hit === null) return d;
            return { ...d, bookmarked: true, bookmarkId: hit > 0 ? hit : undefined };
          }),
        );
        setTotalPages(result.totalPages);
      } catch (e) {
        const msg = e instanceof Error ? e.message : '추천 개발자를 불러오지 못했습니다.';
        setError(msg);
        setList([]);
        setTotalPages(0);
        console.error('[추천 개발자] 에러', msg, '요청 params:', buildApiParams(myProjects, pageNum, myProjectOptions), e);
      } finally {
        setLoading(false);
      }
    },
    [getToken, myProjects, myProjectOptions],
  );

  useEffect(() => {
    fetchList(page);
  }, [fetchList, page]);

  const displayList = useMemo(
    () =>
      list.map((d) => {
        const key = d.memberId ?? d.nickname;
        const hit = bookmarkMap[key];
        if (hit === undefined || hit === null) return d;
        return { ...d, bookmarked: true, bookmarkId: hit > 0 ? hit : undefined };
      }),
    [list, bookmarkMap],
  );

  const handleNavigateToDeveloper = useCallback(
    (nickname: string) => navigate(`/developer-detail/${nickname}`),
    [navigate],
  );

  const handleApply = useCallback(
    (key: DeveloperFilterKey) => {
      setOpenFilter(null);
      setPage(1);
      fetchList(1);
    },
    [fetchList],
  );

  const handleBookmarkChange = useCallback(
    async (dev: RecommendDeveloperListItem, next: boolean) => {
      const token = await getToken();
      if (!token) return;
      if (!next && dev.bookmarkId == null) return;

      try {
        if (next) {
          await createBookmark(
            { targetType: 'DEVELOPER', targetNickname: dev.nickname },
            token,
          );
        } else {
          await deleteBookmark(dev.bookmarkId!, token);
        }
        await queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      } catch (e) {
        console.error('[북마크]', e);
        alert(e instanceof Error ? e.message : '북마크 처리에 실패했습니다.');
      }
    },
    [getToken, queryClient],
  );

  const handleBookmarkChangeById = useCallback(
    (memberId: number, listItemId: string, next: boolean, _bookmarkId?: number) => {
      const dev = listRef.current.find((d) => d.id === listItemId);
      if (!dev) return;
      void handleBookmarkChange(dev, next);
    },
    [handleBookmarkChange],
  );

  if (!myProjectOptionsLoading && myProjectOptions.length === 0) {
    return (
      <div className="relative min-h-[calc(100vh-6rem)] w-full">
        <div className="pointer-events-none flex min-h-full select-none flex-col gap-6 blur-sm">
          <DeveloperFilterBar
            filters={RECOMMEND_DEVELOPER_FILTERS}
            openFilter={openFilter}
            setOpenFilter={setOpenFilter}
            myProjects={myProjects}
            setMyProjects={setMyProjects}
            myProjectOptions={myProjectOptions}
            myProjectOptionsLoading={myProjectOptionsLoading}
            techStacks={techStacks}
            setTechStacks={setTechStacks}
            interestDomains={interestDomains}
            setInterestDomains={setInterestDomains}
            onApply={handleApply}
            onReset={(key) => {
              if (key === '내 프로젝트 선택') {
                setAutoSelectProject(false);
                setRecommendDeveloper({ myProjects: [] });
              }
              setOpenFilter(null);
              setPage(1);
              fetchList(1);
            }}
          />
          <div className="flex flex-col gap-6" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <ReportRequiredCard
            title="프로젝트를 등록하면 맞춤 추천을 받을 수 있어요"
            description="나에게 맞는 추천 개발자를 받아 보세요"
            linkLabel="프로젝트 등록하러 가기"
            linkTo="/project/create"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-10">
      <DeveloperFilterBar
        filters={RECOMMEND_DEVELOPER_FILTERS}
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
        myProjects={myProjects}
        setMyProjects={setMyProjects}
        myProjectOptions={myProjectOptions}
        myProjectOptionsLoading={myProjectOptionsLoading}
        techStacks={techStacks}
        setTechStacks={setTechStacks}
        interestDomains={interestDomains}
        setInterestDomains={setInterestDomains}
        onApply={handleApply}
        onReset={(key) => {
          if (key === '내 프로젝트 선택') {
            setAutoSelectProject(false);
            setRecommendDeveloper({ myProjects: [] });
          }
          setOpenFilter(null);
          setPage(1);
          fetchList(1);
        }}
      />

      {(myProjectOptionsLoading || (loading && myProjects.length > 0)) && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <p className="text-red-500" role="alert">
          {error}
        </p>
      )}

      {!loading && myProjects.length > 0 && list.length === 0 && (
        <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center py-12 text-center">
          <p className="text-2xl font-semibold text-[var(--ui-900)]">해당 프로젝트에 맞는 추천 개발자가 없습니다.</p>
          <p className="mt-2 text-lg text-[var(--ui-600)]">다른 프로젝트를 선택하거나 필터 조건을 변경해 보세요.</p>
        </div>
      )}

      {!loading && myProjects.length === 0 && !myProjectOptionsLoading && myProjectOptions.length === 0 && (
        <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center py-12 text-center">
          <p className="text-2xl font-semibold text-[var(--ui-900)]">등록한 프로젝트가 없습니다.</p>
          <p className="mt-2 text-lg text-[var(--ui-600)]">프로젝트를 만든 뒤 추천 개발자를 확인할 수 있어요.</p>
        </div>
      )}

      {!loading && myProjects.length > 0 && displayList.length > 0 && (
        <>
          <div className="flex flex-col gap-6">
            {displayList.map((dev) => (
              <RecommendDeveloperCard
                key={dev.id}
                role={dev.role}
                roleTone={dev.roleTone}
                nickname={dev.nickname}
                profileImageUrl={dev.profileImageUrl}
                introduction={dev.introduction}
                domains={dev.domains}
                techStack={dev.techStack}
                matchedProjectName={myProjects.length > 0 ? myProjects.join(', ') : '선택한 프로젝트'}
                matchedReason="프로젝트의 요구사항과 일치합니다."
                bookmarked={dev.bookmarked ?? false}
                memberId={dev.memberId ?? undefined}
                bookmarkId={dev.bookmarkId}
                listItemId={dev.id}
                onBookmarkChangeById={handleBookmarkChangeById}
                onNavigateToDeveloper={handleNavigateToDeveloper}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RecommendDeveloperPage;
