import { useAuth } from '@clerk/clerk-react';
import DeveloperFilterBar, { type DeveloperFilterKey } from '@components/common/DeveloperFilterBar';
import Pagination from '@components/common/Pagination';
import RecommendDeveloperCard from '@components/common/RecommendDeveloperCard';
import { useCallback, useEffect, useState } from 'react';
import {
  getMyProjects,
  getRecommendMembers,
  type GetRecommendMembersParams,
  type RecommendDeveloperListItem,
} from '@apis/members';

/** 추천 개발자 페이지: 내 프로젝트 선택만 노출 (포지션/기술스택, 관심 도메인 제외) */
const RECOMMEND_DEVELOPER_FILTERS = ['내 프로젝트 선택'] as const;

type MyProjectOption = { id: number; name: string };

function buildApiParams(
  selectedProjectNames: string[],
  page: number,
  myProjectOptions: MyProjectOption[],
): GetRecommendMembersParams | null {
  const projectIds = selectedProjectNames
    .map((name) => myProjectOptions.find((p) => p.name === name)?.id)
    .filter((id): id is number => typeof id === 'number' && id > 0);

  if (projectIds.length === 0) return null;

  // 서버 스펙 상 projectId가 필수로 보이므로 첫 번째를 projectId로 넣고,
  // "전체" 선택(복수 프로젝트) 시에는 projectIds도 같이 전달 (서버가 지원하면 합집합 추천 가능)
  return { projectId: projectIds[0], projectIds, page, size: 10 };
}

const RecommendDeveloperPage = () => {
  const { getToken } = useAuth();

  const [openFilter, setOpenFilter] = useState<DeveloperFilterKey | null>(null);
  const [myProjects, setMyProjects] = useState<string[]>([]);
  const [myProjectOptions, setMyProjectOptions] = useState<MyProjectOption[]>([]);
  const [myProjectOptionsLoading, setMyProjectOptionsLoading] = useState(false);
  const [interestDomains, setInterestDomains] = useState<string[]>([]);
  const [techStacks, setTechStacks] = useState<string[]>([]);
  const [list, setList] = useState<RecommendDeveloperListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // 내 프로젝트 옵션 로드 (드롭다운 실제 데이터)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const token = await getToken();
      if (!token) return;
      setMyProjectOptionsLoading(true);
      try {
        const projects = await getMyProjects(token);
        if (cancelled) return;
        // 서버가 중복 프로젝트를 내려줄 수 있어 id 기준 dedupe + 이름 중복 시 라벨 구분
        const uniqById = Array.from(new Map(projects.map((p) => [p.id, p])).values());
        // 중복 이름이면 먼저 나온 순서대로 (1)(2)... 붙이기
        const seenCounts: Record<string, number> = {};
        setMyProjectOptions(
          uniqById.map((p) => {
            const base = p.name ?? '';
            seenCounts[base] = (seenCounts[base] ?? 0) + 1;
            const n = seenCounts[base];
            const label = n > 1 ? `${base}(${n})` : base;
            return { id: p.id, name: label };
          }),
        );
      } catch (e) {
        if (!cancelled) setMyProjectOptions([]);
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

  // 기본값: 내가 만든 프로젝트가 있으면 "전체(=전부 선택)" 상태로 시작
  useEffect(() => {
    if (myProjectOptionsLoading) return;
    if (myProjectOptions.length === 0) return;
    if (myProjects.length > 0) return;
    setMyProjects(myProjectOptions.map((p) => p.name));
    setPage(1);
  }, [myProjectOptionsLoading, myProjectOptions, myProjects.length]);

  // 체크할 때마다 즉시 추천 개발자 갱신 (저장 버튼 없이도 동작)
  useEffect(() => {
    if (myProjectOptionsLoading) return;
    if (myProjectOptions.length === 0) return;
    // 선택이 바뀌면 첫 페이지부터 다시 조회
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
        setList(result.list);
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
          setOpenFilter(null);
          setPage(1);
          fetchList(1);
        }}
      />

      {myProjectOptionsLoading && (
        <p className="text-[var(--ui-500)]">내 프로젝트를 불러오는 중...</p>
      )}

      {!myProjectOptionsLoading && myProjectOptions.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <p className="font-medium">등록한 프로젝트가 없습니다.</p>
          <p className="mt-1 text-sm">프로젝트를 만든 뒤 추천 개발자를 확인할 수 있어요.</p>
        </div>
      )}

      {myProjects.length === 0 && !myProjectOptionsLoading && myProjectOptions.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <p className="font-medium">내 프로젝트를 선택해 주세요.</p>
          <p className="mt-1 text-sm">선택한 프로젝트(또는 전체 프로젝트) 기준으로 추천 개발자를 보여드려요.</p>
        </div>
      )}

      {error && (
        <p className="text-red-500" role="alert">
          {error}
        </p>
      )}

      {loading && myProjects.length > 0 && (
        <p className="text-[var(--ui-500)]">추천 개발자를 불러오는 중...</p>
      )}

      {!loading && myProjects.length > 0 && (
        <>
          <div className="flex flex-col gap-6">
            {list.length === 0 ? (
              <p className="text-[var(--ui-500)]">추천 개발자가 없습니다.</p>
            ) : (
              list.map((dev) => (
                <RecommendDeveloperCard
                  key={dev.id}
                  role={dev.role}
                  roleTone={dev.roleTone}
                  nickname={dev.nickname}
                  profileImageUrl={dev.profileImageUrl}
                  introduction={dev.introduction}
                  domains={dev.domains}
                  techStack={dev.techStack}
                  bookmarked={false}
                  onBookmarkChange={(next) => console.log('bookmark', dev.id, next)}
                  onClick={() => console.log('click developer', dev.id)}
                />
              ))
            )}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} className="mt-6" />
        </>
      )}
    </div>
  );
};

export default RecommendDeveloperPage;
