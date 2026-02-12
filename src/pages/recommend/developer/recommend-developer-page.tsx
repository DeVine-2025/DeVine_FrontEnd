import { useAuth } from '@clerk/clerk-react';
import DeveloperFilterBar, { type DeveloperFilterKey } from '@components/common/DeveloperFilterBar';
import LoadingSpinner from '@components/common/LoadingSpinner';
import RecommendDeveloperCard from '@components/common/RecommendDeveloperCard';
import ReportRequiredCard from '@components/common/ReportRequiredCard';
import { getReports } from '@apis/report/report-queries';
import { useAuthStore } from '@store/auth';
import { useFilterStore } from '@store/filter';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBookmark, deleteBookmark, getBookmarks } from '@apis/bookmarks';
import { getRecommendMembers, type GetRecommendMembersParams, type RecommendDeveloperListItem } from '@apis/members';
import { getMyRecruitingProjects } from '@apis/projects';

const RECOMMEND_DEVELOPER_FILTERS = ['내 프로젝트 선택'] as const;

type MyProjectOption = { id: number; name: string };
const MY_PROJECTS_CACHE_KEY = 'devine_my_projects_cache_v1';

function readMyProjectsCache(): MyProjectOption[] {
  try {
    const raw = localStorage.getItem(MY_PROJECTS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (v): v is { id: unknown; name: unknown } =>
          v != null && typeof v === 'object' && 'id' in (v as any) && 'name' in (v as any),
      )
      .map((v) => ({ id: Number((v as any).id), name: String((v as any).name) }))
      .filter((v) => Number.isFinite(v.id) && v.id > 0 && v.name.trim().length > 0);
  } catch {
    return [];
  }
}

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

const RecommendDeveloperPage = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const userRole = useAuthStore((state) => state.role);
  const isPm = userRole === 'pm';
  const {
    recommendDeveloper,
    setRecommendDeveloper,
  } = useFilterStore();
  const { myProjects, interestDomains, techStacks } = recommendDeveloper;

  const [hasReport, setHasReport] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    getReports()
      .then((res) => {
        if (cancelled) return;
        const reports = res?.result?.reports ?? [];
        setHasReport(reports.length > 0);
      })
      .catch(() => {
        if (!cancelled) setHasReport(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [openFilter, setOpenFilter] = useState<DeveloperFilterKey | null>(null);
  const [myProjectOptions, setMyProjectOptions] = useState<MyProjectOption[]>([]);
  const lastLoadedProjectOptionsRef = useRef<MyProjectOption[]>([]);
  const [myProjectOptionsLoading, setMyProjectOptionsLoading] = useState(false);
  const [autoSelectProject, setAutoSelectProject] = useState(true);
  const [list, setList] = useState<RecommendDeveloperListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [bookmarkMap, setBookmarkMap] = useState<Record<string | number, number>>({});
  const bookmarkMapRef = useRef(bookmarkMap);
  bookmarkMapRef.current = bookmarkMap;
  const listRef = useRef<RecommendDeveloperListItem[]>([]);
  listRef.current = list;

  useEffect(() => {
    const cached = readMyProjectsCache();
    if (cached.length === 0) return;
    lastLoadedProjectOptionsRef.current = cached;
    setMyProjectOptions(cached);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const token = await getToken();
      if (!token || cancelled) return;
      try {
        const bookmarks = await getBookmarks(token);
        if (cancelled) return;
        const next: Record<string | number, number> = {};
        for (const b of bookmarks) {
          if (b.targetType !== 'DEVELOPER') continue;
          const key = b.targetNickname ?? b.targetId;
          if (key !== undefined && key !== null) next[key] = b.bookmarkId;
        }
        bookmarkMapRef.current = next;
        setBookmarkMap(next);
        setList((prev) =>
          prev.map((d) => {
            const key = d.memberId ?? d.nickname;
            const hit = next[key];
            if (hit === undefined || hit === null) return d;
            return { ...d, bookmarked: true, bookmarkId: hit > 0 ? hit : undefined };
          }),
        );
      } catch (e) {
        console.error('[북마크] 목록 로드 실패', e);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

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
    let cancelled = false;
    const load = async () => {
      const token = await getToken();
      if (!token) return;
      setMyProjectOptionsLoading(true);
      try {
        const projects = await getMyRecruitingProjects(token);
        if (cancelled) return;
        const uniqById = Array.from(new Map(projects.map((p) => [p.projectId, p])).values());
        const seenCounts: Record<string, number> = {};
        const fromApi: MyProjectOption[] = uniqById.map((p) => {
          const base = (p.title ?? '').trim() || `프로젝트 ${p.projectId}`;
          seenCounts[base] = (seenCounts[base] ?? 0) + 1;
          const n = seenCounts[base];
          const label = n > 1 ? `${base} (${n})` : base;
          return { id: p.projectId, name: label };
        });
        const cached = readMyProjectsCache();
        const apiIds = new Set(fromApi.map((p) => p.id));
        const onlyInCache = cached.filter((p) => !apiIds.has(p.id));
        const next = onlyInCache.length > 0 ? [...onlyInCache, ...fromApi] : fromApi;
        if (next.length > 0) {
          lastLoadedProjectOptionsRef.current = next;
          setMyProjectOptions(next);
          writeMyProjectsCache(next);
        } else {
          setMyProjectOptions(lastLoadedProjectOptionsRef.current);
        }
      } catch (e) {
        if (!cancelled) setMyProjectOptions(lastLoadedProjectOptionsRef.current);
        console.error('[내 프로젝트 옵션] 로드 실패', e);
      } finally {
        if (!cancelled) setMyProjectOptionsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

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
      const mapKey: string | number = dev.memberId ?? dev.nickname;
      const prevBookmarkId = bookmarkMapRef.current[mapKey];

      if (next) {
        setBookmarkMap((prev) => ({ ...prev, [mapKey]: -1 }));
        setList((prev) =>
          prev.map((d) =>
            d.id === dev.id ? { ...d, bookmarked: true, bookmarkId: undefined } : d,
          ),
        );
      } else {
        if (dev.bookmarkId == null) return;
        setBookmarkMap((prev) => {
          const nextMap = { ...prev };
          delete nextMap[mapKey];
          return nextMap;
        });
        setList((prev) =>
          prev.map((d) =>
            d.id === dev.id ? { ...d, bookmarked: false, bookmarkId: undefined } : d,
          ),
        );
      }

      try {
        if (next) {
          const { bookmarkId } = await createBookmark(
            { targetType: 'DEVELOPER', targetNickname: dev.nickname },
            token,
          );
          setBookmarkMap((prev) => ({ ...prev, [mapKey]: bookmarkId }));
          setList((prev) =>
            prev.map((d) =>
              d.id === dev.id ? { ...d, bookmarked: true, bookmarkId } : d,
            ),
          );
        } else {
          if (dev.bookmarkId == null) return;
          await deleteBookmark(dev.bookmarkId, token);
        }
      } catch (e) {
        console.error('[북마크]', e);
        if (next) {
          setBookmarkMap((prev) => {
            const nextMap = { ...prev };
            delete nextMap[mapKey];
            return nextMap;
          });
          setList((prev) =>
            prev.map((d) =>
              d.id === dev.id ? { ...d, bookmarked: false, bookmarkId: prevBookmarkId } : d,
            ),
          );
        } else {
          setBookmarkMap((prev) => ({ ...prev, [mapKey]: dev.bookmarkId! }));
          setList((prev) =>
            prev.map((d) =>
              d.id === dev.id ? { ...d, bookmarked: true, bookmarkId: dev.bookmarkId } : d,
            ),
          );
        }
        alert(e instanceof Error ? e.message : '북마크 처리에 실패했습니다.');
      }
    },
    [getToken],
  );

  const handleBookmarkChangeById = useCallback(
    (memberId: number, listItemId: string, next: boolean, _bookmarkId?: number) => {
      const dev = listRef.current.find((d) => d.id === listItemId);
      if (!dev) return;
      void handleBookmarkChange(dev, next);
    },
    [handleBookmarkChange],
  );

  if (hasReport === false) {
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
          {isPm ? (
            <ReportRequiredCard
              title="프로젝트를 등록하면 맞춤 추천을 받을 수 있어요"
              description="나에게 맞는 추천 개발자를 받아 보세요"
              linkLabel="프로젝트 등록하러 가기"
              linkTo="/project/create"
            />
          ) : (
            <ReportRequiredCard description="나에게 맞는 추천 개발자를 받아 보세요" />
          )}
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

      {myProjectOptionsLoading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <p className="text-red-500" role="alert">
          {error}
        </p>
      )}

      {loading && myProjects.length > 0 && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
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

      {!loading && myProjects.length > 0 && list.length > 0 && (
        <>
          <div className="flex flex-col gap-6">
            {list.map((dev) => (
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
                onClick={() => navigate(`/developer-detail/${dev.nickname}`)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RecommendDeveloperPage;
