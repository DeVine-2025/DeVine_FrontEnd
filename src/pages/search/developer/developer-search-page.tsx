import DeveloperFilterBar, { type DeveloperFilterKey } from '@components/common/DeveloperFilterBar';
import ProfileCard from '@components/common/ProfileCard';
import { useAuth } from '@clerk/clerk-react';
import { createBookmark, deleteBookmark, getBookmarks } from '@apis/bookmarks';
import { useFilterStore } from '@store/filter';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEVELOPER_FILTERS, PROFILE_CARD_LIST } from 'src/mocks/developer.mock';

const DeveloperSearchPage = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { developerSearch, setDeveloperSearch } = useFilterStore();
  const { interestDomains, myProjects, techStacks } = developerSearch;

  const [openFilter, setOpenFilter] = useState<DeveloperFilterKey | null>(null);
  const [bookmarkMap, setBookmarkMap] = useState<Record<number, number>>({});

  const setInterestDomains = (v: string[]) => setDeveloperSearch({ interestDomains: v });
  const setMyProjects = (v: string[]) => setDeveloperSearch({ myProjects: v });
  const setTechStacks = (v: string[]) => setDeveloperSearch({ techStacks: v });

  // 새로고침 시에도 북마크 상태 유지: 내 북마크 목록 하이드레이션
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
          if (b.targetType !== 'DEVELOPER') continue;
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

  const profiles = useMemo(() => PROFILE_CARD_LIST, []);

  const handleBookmarkChange = useCallback(
    async (memberId: number | undefined, next: boolean) => {
      if (memberId == null) {
        alert('개발자 북마크는 현재 지원되지 않습니다.');
        return;
      }
      const token = await getToken();
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }
      try {
        if (next) {
          const { bookmarkId } = await createBookmark(
            { targetType: 'DEVELOPER', targetId: memberId },
            token,
          );
          setBookmarkMap((prev) => ({ ...prev, [memberId]: bookmarkId }));
        } else {
          const bookmarkId = bookmarkMap[memberId];
          if (bookmarkId == null) return;
          await deleteBookmark(bookmarkId, token);
          setBookmarkMap((prev) => {
            const n = { ...prev };
            delete n[memberId];
            return n;
          });
        }
      } catch (e) {
        console.error('[북마크]', e);
        alert(e instanceof Error ? e.message : '북마크 처리에 실패했습니다.');
      }
    },
    [bookmarkMap, getToken, navigate],
  );

  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-10">
      {/* 추천 개발자 */}
      <header className="flex items-center justify-between">
        <h2 className="pl-5 font-semibold text-[16px] text-card-title">추천 개발자</h2>

        <button
          type="button"
          onClick={() => navigate('/recommend')}
          className="inline-flex cursor-pointer items-center gap-2 font-medium text-card-muted text-xl hover:opacity-80"
        >
          더 많은 추천 개발자 보러가기
          <span aria-hidden="true" className="text-3xl leading-none">
            ›
          </span>
        </button>
      </header>

      {/* 추천 개발자 카드 */}
      <div className="scrollbar-hide flex justify-between gap-6 overflow-x-auto">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            {...profile}
            size="sm"
            bookmarked={profile.memberId != null ? bookmarkMap[profile.memberId] != null : profile.bookmarked}
            onBookmarkChange={(next) => handleBookmarkChange(profile.memberId, next)}
          />
        ))}
      </div>

      {/* 구분선 */}
      <div className="h-px w-full bg-card-border" />

      {/* 필터 */}
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
        onApply={(key) => console.log('apply', key)}
        onReset={(key) => console.log('reset', key)}
      />

      {/* 개발자 리스트 */}
      <div className="flex flex-col gap-4">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            {...profile}
            size="lg"
            bookmarked={profile.memberId != null ? bookmarkMap[profile.memberId] != null : profile.bookmarked}
            onBookmarkChange={(next) => handleBookmarkChange(profile.memberId, next)}
          />
        ))}
      </div>
    </section>
  );
};

export default DeveloperSearchPage;
