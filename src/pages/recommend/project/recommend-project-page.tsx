import { useAuth } from '@clerk/clerk-react';
import Pagination from '@components/common/Pagination';
import ProjectFiltersBar from '@components/common/ProjectFilterBar';
import RecommendProjectCard from '@components/common/RecommendProjectCard';
import { useFilterStore } from '@store/filter';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBookmark, deleteBookmark, getBookmarks } from '@apis/bookmarks';
import {
  getRecommendProjects,
  type GetRecommendProjectsParams,
  type ProjectListItem,
} from '@apis/recommend';
import { PROJECT_FILTERS, PROJECT_ROLES } from 'src/mocks/recommendProject.mock';

/** 필터 UI 값 → API 파라미터 (GET /api/v1/projects/recommend 스펙) */
const projectFieldMap: Record<string, string> = {
  웹: 'WEB',
  '모바일/앱': 'MOBILE',
  게임: 'GAME',
  블록체인: 'BLOCKCHAIN',
  기타: 'ETC',
};
const categoryMap: Record<string, string> = {
  헬스케어: 'HEALTHCARE',
  핀테크: 'FINTECH',
  이커머스: 'ECOMMERCE',
  교육: 'EDUCATION',
  '소셜/커뮤니티': 'SOCIAL',
  엔터테인먼트: 'ENTERTAINMENT',
  'AI/데이터': 'AI_DATA',
  기타: 'ETC',
};
const durationRangeMap: Record<string, string> = {
  '1개월 이하': 'UNDER_ONE',
  '1-3개월': 'ONE_TO_THREE',
  '3-6개월': 'THREE_TO_SIX',
  '6개월 이상': 'SIX_PLUS',
};
/** API positions: ALL, FRONTEND, BACKEND, INFRA 만 지원 */
const positionMap: Record<string, string> = {
  프론트엔드: 'FRONTEND',
  백엔드: 'BACKEND',
  인프라: 'INFRA',
};
/** 기술스택 UI → API techstackNames (일부 예시, 필요 시 확장) */
const techstackNameMap: Record<string, string> = {
  JAVA: 'JAVA',
  JAVASCRIPT: 'JAVASCRIPT',
  TYPESCRIPT: 'TYPESCRIPT',
  REACT: 'REACT',
  SPRINGBOOT: 'SPRINGBOOT',
  NODEJS: 'NODEJS',
  PYTHON: 'PYTHON',
  KOTLIN: 'KOTLIN',
  SWIFT: 'SWIFT',
  REACT_NATIVE: 'REACT_NATIVE',
  FLUTTER: 'FLUTTER',
  AWS: 'AWS',
  DOCKER: 'DOCKER',
  MYSQL: 'MYSQL',
  MONGODB: 'MONGODB',
};

function buildApiParams(
  projectTypes: string[],
  domains: string[],
  expectedPeriods: string[],
  techStacks: string[],
  page: number,
): GetRecommendProjectsParams {
  const projectFields = projectTypes
    .filter((t) => t !== '전체')
    .map((t) => projectFieldMap[t])
    .filter(Boolean);
  const categories = domains
    .filter((d) => d !== '전체')
    .map((d) => categoryMap[d])
    .filter(Boolean);
  const durationRanges = expectedPeriods
    .map((p) => durationRangeMap[p])
    .filter(Boolean);
  const positions = techStacks
    .map((t) => positionMap[t])
    .filter(Boolean);
  const techstackNames = techStacks
    .filter((t) => !positionMap[t])
    .map((t) => techstackNameMap[t] ?? t.toUpperCase().replace(/\s+/g, '_'))
    .filter(Boolean);
  return {
    page,
    size: 10,
    ...(projectFields.length > 0 && { projectFields }),
    ...(categories.length > 0 && { categories }),
    ...(durationRanges.length > 0 && { durationRanges }),
    ...(positions.length > 0 && { positions }),
    ...(techstackNames.length > 0 && { techstackNames }),
  };
}

const RecommendProjectPage = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { recommendProject, setRecommendProject } = useFilterStore();
  const { domains, expectedPeriods, projectTypes, techStacks } = recommendProject;

  const [openFilter, setOpenFilter] = useState<null | (typeof PROJECT_FILTERS)[number]>(null);
  const [list, setList] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [bookmarkMap, setBookmarkMap] = useState<Record<number, number>>({});
  const bookmarkMapRef = useRef(bookmarkMap);
  bookmarkMapRef.current = bookmarkMap;

  // 새로고침 시에도 북마크가 칠해져 보이도록: 내 북마크 목록을 먼저 로드
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
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
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const setDomains = useCallback((v: string[]) => setRecommendProject({ domains: v }), [setRecommendProject]);
  const setExpectedPeriods = useCallback((v: string[]) => setRecommendProject({ expectedPeriods: v }), [setRecommendProject]);
  const setProjectTypes = useCallback((v: string[]) => setRecommendProject({ projectTypes: v }), [setRecommendProject]);
  const setTechStacks = useCallback((v: string[]) => setRecommendProject({ techStacks: v }), [setRecommendProject]);

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
        const params = buildApiParams(
          projectTypes,
          domains,
          expectedPeriods,
          techStacks,
          pageNum,
        );
        const result = await getRecommendProjects(token, params);
        const map = bookmarkMapRef.current;
        setList(
          result.list.map((p) => {
            const hit = map[Number(p.id)];
            return hit ? { ...p, bookmarked: true, bookmarkId: hit } : p;
          }),
        );
        setTotalPages(result.totalPages);
      } catch (e) {
        setError(e instanceof Error ? e.message : '추천 프로젝트를 불러오지 못했습니다.');
        setList([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [getToken, projectTypes, domains, expectedPeriods, techStacks],
  );

  useEffect(() => {
    fetchList(page);
  }, [fetchList, page]);

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

      // 낙관적 UI: 먼저 UI 반영
      const prevMap = bookmarkMapRef.current;
      const prevBookmarkId = prevMap[targetId];
      if (next) {
        setBookmarkMap((prev) => ({ ...prev, [targetId]: 0 }));
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
          const { bookmarkId } = await createBookmark(
            { targetType: 'PROJECT', targetId },
            token,
          );
          setBookmarkMap((prev) => ({ ...prev, [targetId]: bookmarkId }));
          setList((prev) =>
            prev.map((p) =>
              p.id === projectId ? { ...p, bookmarked: true, bookmarkId } : p,
            ),
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

  const handleApply = useCallback(
    (key: (typeof PROJECT_FILTERS)[number]) => {
      setOpenFilter(null);
      setPage(1);
      fetchList(1);
    },
    [fetchList],
  );

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
        onReset={(key) => {
          setOpenFilter(null);
          setPage(1);
          fetchList(1);
        }}
      />

      {error && (
        <p className="text-red-500" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-[var(--ui-500)]">추천 프로젝트를 불러오는 중...</p>
      ) : (
        <div className="flex flex-col gap-6">
          {list.length === 0 ? (
            <p className="text-[var(--ui-500)]">추천 프로젝트가 없습니다.</p>
          ) : (
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
            ))
          )}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} className="mt-6" />
    </div>
  );
};

export default RecommendProjectPage;
