import { useAuth } from '@clerk/clerk-react';
import DeveloperFilterBar, { type DeveloperFilterKey } from '@components/common/DeveloperFilterBar';
import RecommendDeveloperCard from '@components/common/RecommendDeveloperCard';
import { useCallback, useEffect, useState } from 'react';
import {
  getRecommendMembers,
  type GetRecommendMembersParams,
  type RecommendDeveloperListItem,
} from '@apis/members';
import { DEVELOPER_FILTERS } from 'src/mocks/developer.mock';

/** 관심 도메인(한글) → API category */
const categoryMap: Record<string, string> = {
  헬스케어: 'HEALTHCARE',
  핀테크: 'FINANCE',
  이커머스: 'ECOMMERCE',
  교육: 'EDUCATION',
  '소셜/커뮤니티': 'ETC',
  엔터테인먼트: 'ENTERTAINMENT',
  'AI/데이터': 'ETC',
  기타: 'ETC',
};

function buildApiParams(
  _myProjects: string[],
  interestDomains: string[],
  techStacks: string[],
  page: number,
): GetRecommendMembersParams {
  const category = interestDomains
    .filter((d) => d !== '전체')
    .map((d) => categoryMap[d])
    .find(Boolean);
  const techstackName = techStacks
    .filter((t) => t && t !== '전체')
    .map((t) => t.trim().toUpperCase().replace(/\s+/g, '_'))
    .find(Boolean);
  return {
    page,
    size: 10,
    ...(category && { category }),
    ...(techstackName && { techstackName }),
  };
}

const RecommendDeveloperPage = () => {
  const { getToken } = useAuth();
  const [openFilter, setOpenFilter] = useState<DeveloperFilterKey | null>(null);
  const [interestDomains, setInterestDomains] = useState<string[]>([]);
  const [myProjects, setMyProjects] = useState<string[]>([]);
  const [techStacks, setTechStacks] = useState<string[]>([]);
  const [list, setList] = useState<RecommendDeveloperListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

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
        const params = buildApiParams(myProjects, interestDomains, techStacks, pageNum);
        const result = await getRecommendMembers(token, params);
        setList(result.list);
      } catch (e) {
        setError(e instanceof Error ? e.message : '추천 개발자를 불러오지 못했습니다.');
        setList([]);
      } finally {
        setLoading(false);
      }
    },
    [getToken, myProjects, interestDomains, techStacks],
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
        filters={DEVELOPER_FILTERS}
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
        myProjects={myProjects}
        setMyProjects={setMyProjects}
        techStacks={techStacks}
        setTechStacks={setTechStacks}
        interestDomains={interestDomains}
        setInterestDomains={setInterestDomains}
        onApply={handleApply}
        onReset={() => {
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
        <p className="text-[var(--ui-500)]">추천 개발자를 불러오는 중...</p>
      ) : (
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
      )}
    </div>
  );
};

export default RecommendDeveloperPage;
