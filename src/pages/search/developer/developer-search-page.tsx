import { createBookmark, deleteBookmark, getBookmarks } from '@apis/bookmarks';
import { getDevelopers } from '@apis/developer';
import ChevronRightIcon from '@assets/icons/chevron-right.svg?react';
import { useAuth } from '@clerk/clerk-react';
import DeveloperFilterBar, { type DeveloperFilterKey } from '@components/common/DeveloperFilterBar';
import ProfileCard from '@components/common/ProfileCard';
import { useFilterStore } from '@store/filter';
import type { BadgeTone } from '@t/badgeTone';
import type { DeveloperSearchContentDto } from '@t/profileCard.types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEVELOPER_FILTERS, PROFILE_CARD_LIST } from 'src/mocks/developer.mock';

const DeveloperSearchPage = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { developerSearch, setDeveloperSearch } = useFilterStore();
  const { interestDomains, myProjects, techStacks } = developerSearch;

  const [openFilter, setOpenFilter] = useState<DeveloperFilterKey | null>(null);
  const [searchContent, setSearchContent] = useState<DeveloperSearchContentDto[]>([]);
  const [bookmarkMap, setBookmarkMap] = useState<Record<string | number, number>>({});

  const setInterestDomains = (v: string[]) => setDeveloperSearch({ interestDomains: v });
  const setMyProjects = (v: string[]) => setDeveloperSearch({ myProjects: v });
  const setTechStacks = (v: string[]) => setDeveloperSearch({ techStacks: v });

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const pageData = await getDevelopers(
          {
            page: 1,
            size: 10,
          },
          token,
          controller.signal,
        );

        setSearchContent(pageData.content ?? []);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        console.error('[개발자 검색] 실패', e);
      }
    })();

    return () => controller.abort();
  }, [getToken]);

  // 새로고침 시에도 북마크 상태 유지: 내 북마크 목록 하이드레이션
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

  const FALLBACK_PROFILE_IMAGE = '/images/profile-default.png';

  const searchedProfiles = useMemo(() => {
    return searchContent
      .filter((x) => x.member?.mainType === 'DEVELOPER')
      .map((x, index) => ({
        id: `search-${x.member.nickname}-${index}`,
        memberId: undefined, // id 임시
        nickname: x.member.nickname,
        profileImageUrl: x.member.imageUrl ?? FALLBACK_PROFILE_IMAGE,
        introduction: x.member.body ?? undefined,
        techStack: (x.techstacks ?? []).map((t) => ({
          id: String(t.techstackId),
          name: t.name,
          icon: undefined,
        })),
        role: '개발자',
        roleTone: 'blue' as const,
        badges: (x.domains ?? []).map((d, i) => ({
          id: `d-${index}-${i}`,
          label: d,
          tone: 'gray' as BadgeTone,
        })),
        bookmarked: false,
      }));
  }, [searchContent]);

  console.log(searchedProfiles);

  const handleBookmarkChange = useCallback(
    async (memberId: number | undefined, nickname: string, next: boolean) => {
      const mapKey = memberId ?? nickname;
      const token = await getToken();
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }
      const prevId = bookmarkMap[mapKey];
      if (next) {
        setBookmarkMap((prev) => ({ ...prev, [mapKey]: -1 }));
      } else {
        if (prevId == null || prevId <= 0) return;
        setBookmarkMap((prev) => {
          const n = { ...prev };
          delete n[mapKey];
          return n;
        });
      }
      try {
        if (next) {
          const { bookmarkId } = await createBookmark(
            { targetType: 'DEVELOPER', targetNickname: nickname },
            token,
          );
          setBookmarkMap((prev) => ({ ...prev, [mapKey]: bookmarkId }));
        } else {
          await deleteBookmark(prevId, token);
        }
      } catch (e) {
        console.error('[북마크]', e);
        if (next) {
          setBookmarkMap((prev) => {
            const n = { ...prev };
            delete n[mapKey];
            return n;
          });
        } else {
          setBookmarkMap((prev) => ({ ...prev, [mapKey]: prevId }));
        }
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
          <ChevronRightIcon className="h-6 w-6 shrink-0" aria-hidden />
        </button>
      </header>

      {/* 추천 개발자 카드 */}
      <div className="scrollbar-hide flex justify-between gap-6 overflow-x-auto">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            {...profile}
            size="sm"
            bookmarked={
              bookmarkMap[profile.memberId ?? profile.nickname] != null ||
              (profile.bookmarked ?? false)
            }
            onBookmarkChange={(next) =>
              handleBookmarkChange(profile.memberId, profile.nickname, next)
            }
          />
        ))}
      </div>

      {/* 구분선 */}
      <div className="h-px w-full bg-card-border" />

      {/* 필터 */}
      <DeveloperFilterBar
        filters={DEVELOPER_FILTERS}
        excludeFilters={['내 프로젝트 선택']}
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
        {searchedProfiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            {...profile}
            size="lg"
            bookmarked={
              bookmarkMap[profile.memberId ?? profile.nickname] != null ||
              (profile.bookmarked ?? false)
            }
            onBookmarkChange={(next) =>
              handleBookmarkChange(profile.memberId, profile.nickname, next)
            }
          />
        ))}
      </div>
    </section>
  );
};

export default DeveloperSearchPage;
