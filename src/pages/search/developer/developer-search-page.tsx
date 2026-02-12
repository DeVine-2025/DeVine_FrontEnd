import { createBookmark, deleteBookmark, getBookmarks } from '@apis/bookmarks';
import { getDevelopers } from '@apis/developer';
import { getMyRecruitingProjects } from '@apis/projects';
import { getRecommendMembersPreview } from '@apis/recommendMembers';
import ChevronRightIcon from '@assets/icons/chevron-right.svg?react';
import profileDefaultSvg from '@assets/icons/profile-default.svg';
import { useAuth } from '@clerk/clerk-react';
import DeveloperFilterBar, { type DeveloperFilterKey } from '@components/common/DeveloperFilterBar';
import Pagination from '@components/common/Pagination';
import ProfileCard from '@components/common/ProfileCard';
import { useFilterStore } from '@store/filter';
import type { BadgeTone } from '@t/badgeTone';
import { DOMAIN_CODE_TO_LABEL, DOMAIN_LABEL_TO_CODE, ROLE_LABEL, ROLE_PRIORITY } from '@t/member';
import type {
  DeveloperSearchContentDto,
  MemberSearchCategory,
  ProfileCardProps,
} from '@t/profileCard.types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DEVELOPER_FILTERS = ['내 프로젝트 선택', '포지션 / 기술스택', '관심 도메인'] as const;

type RoleCode = (typeof ROLE_PRIORITY)[number];
type RoleKey = RoleCode | 'DEVELOPER';

const pickRole = (roles: string[]): RoleKey => {
  for (const r of ROLE_PRIORITY) {
    if (roles.includes(r)) return r;
  }
  return 'DEVELOPER';
};

const isMemberSearchCategory = (v: string): v is MemberSearchCategory => v in DOMAIN_CODE_TO_LABEL;

const DeveloperSearchPage = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { developerSearch, setDeveloperSearch } = useFilterStore();
  const { interestDomains, myProjects, techStacks } = developerSearch;

  // 프로젝트 등록 유무 확인
  const [hasProjects, setHasProjects] = useState<boolean | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const token = await getToken();
      if (!token || cancelled) return;
      try {
        const projects = await getMyRecruitingProjects(token);
        if (cancelled) return;

        setHasProjects(projects.length > 0);
        setProjectId(projects[0]?.projectId ?? null);
      } catch {
        if (!cancelled) {
          setHasProjects(false);
          setProjectId(null);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const [openFilter, setOpenFilter] = useState<DeveloperFilterKey | null>(null);
  const [searchContent, setSearchContent] = useState<DeveloperSearchContentDto[]>([]);
  const [bookmarkMap, setBookmarkMap] = useState<Record<string | number, number>>({});

  const [page, setPage] = useState(1);
  const size = 10;
  const [totalPages, setTotalPages] = useState(0);

  const setInterestDomains = (v: string[]) => setDeveloperSearch({ interestDomains: v });
  const setMyProjects = (v: string[]) => setDeveloperSearch({ myProjects: v });
  const setTechStacks = (v: string[]) => setDeveloperSearch({ techStacks: v });

  const listTopRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void interestDomains;
    void techStacks;
    void myProjects;

    setPage(1);
  }, [interestDomains, techStacks, myProjects]);

  useEffect(() => {
    if (page <= 0) return;

    requestAnimationFrame(() => {
      listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [page]);

  const categories = useMemo<MemberSearchCategory[]>(() => {
    return interestDomains
      .map((label) => DOMAIN_LABEL_TO_CODE[label as keyof typeof DOMAIN_LABEL_TO_CODE])
      .filter(Boolean);
  }, [interestDomains]);

  const params = useMemo(
    () => ({
      page,
      size,
      categories,
      techNames: techStacks,
    }),
    [page, categories, techStacks],
  );

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const token = await getToken(); // null일 수 있음
        const pageData = await getDevelopers(params, token, controller.signal);
        setSearchContent(pageData.content ?? []);
        setTotalPages(pageData.totalPages ?? 0);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        console.error('[개발자 검색] 실패', e);
        setSearchContent([]);
        setTotalPages(0);
      }
    })();

    return () => controller.abort();
  }, [getToken, params]);

  const [profiles, setProfiles] = useState<ProfileCardProps[]>([]);

  useEffect(() => {
    if (hasProjects !== true) return;
    if (!projectId) return;

    const controller = new AbortController();

    (async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const result = await getRecommendMembersPreview(projectId, 4, token, controller.signal);

        const mapped = result.map((x, index) => {
          const roleNames = (x.techstacks ?? []).filter((t) => t.genre == null).map((t) => t.name);
          const roleKey = pickRole(roleNames);

          const pureTechStacks = (x.techstacks ?? [])
            .filter((t) => t.genre != null)
            .map((t) => ({
              id: String(t.techstackId),
              name: t.name,
            }));

          return {
            id: `preview-${x.member.nickname}-${index}`,
            nickname: x.member.nickname,
            profileImageUrl: x.member.imageUrl ?? FALLBACK_PROFILE_IMAGE,

            introduction: x.member.body ?? '',

            techStack: pureTechStacks,

            role: ROLE_LABEL[roleKey] ?? '개발자',
            roleTone: 'blue' as const,

            badges: (x.domains ?? []).map((d) => ({
              label: isMemberSearchCategory(d) ? DOMAIN_CODE_TO_LABEL[d] : d,
              tone: 'gray' as BadgeTone,
            })),

            bookmarked: false,
          };
        });

        setProfiles(mapped);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        console.error('[추천 개발자 프리뷰] 실패', e);
      }
    })();

    return () => controller.abort();
  }, [getToken, hasProjects, projectId]);

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

  const FALLBACK_PROFILE_IMAGE = profileDefaultSvg;

  const searchedProfiles = useMemo(() => {
    return searchContent.map((x, index) => {
      const roleNames = (x.techstacks ?? []).filter((t) => t.genre == null).map((t) => t.name);
      const roleKey = pickRole(roleNames);

      const pureTechStacks = (x.techstacks ?? [])
        .filter((t) => t.genre != null)
        .map((t) => ({
          id: String(t.techstackId),
          name: t.name,
          icon: undefined,
        }));

      return {
        id: `search-${x.member.nickname}-${index}`,
        memberId: undefined,
        nickname: x.member.nickname,
        profileImageUrl: x.member.imageUrl ?? FALLBACK_PROFILE_IMAGE,
        introduction: x.member.body ?? undefined,

        techStack: pureTechStacks,

        role: ROLE_LABEL[roleKey] ?? '개발자',
        roleTone: 'blue' as const,

        badges: (x.domains ?? []).map((d, i) => ({
          id: `d-${index}-${i}`,
          label: isMemberSearchCategory(d) ? DOMAIN_CODE_TO_LABEL[d] : d,
          tone: 'gray' as BadgeTone,
        })),

        bookmarked: false,
      };
    });
  }, [searchContent]);

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

        {hasProjects === true && (
          <button
            type="button"
            onClick={() => navigate('/recommend/developer')}
            className="inline-flex cursor-pointer items-center gap-2 font-medium text-card-muted text-xl hover:opacity-80"
          >
            더 많은 추천 개발자 보러가기
            <ChevronRightIcon className="h-6 w-6 shrink-0" aria-hidden />
          </button>
        )}
      </header>

      {/* 추천 개발자 카드 */}
      {hasProjects !== true ? (
        <p className="py-10 text-center text-[15px] text-[var(--ui-500)]">
          프로젝트를 등록하면 추천 개발자를 볼 수 있어요
        </p>
      ) : (
        <div className="scrollbar-hide flex justify-start gap-6 overflow-x-auto">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              {...profile}
              size="sm"
              bookmarked={bookmarkMap[profile.nickname] != null || (profile.bookmarked ?? false)}
              onBookmarkChange={(next) => handleBookmarkChange(undefined, profile.nickname, next)}
              onClick={() => navigate(`/developer-detail/${profile.nickname}`)}
            />
          ))}
        </div>
      )}

      {/* 구분선 */}
      <div className="h-px w-full bg-card-border" />

      <div ref={listTopRef} />

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
            onClick={() => navigate(`/developer-detail/${profile.nickname}`)}
          />
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} className="mt-6" />
    </section>
  );
};

export default DeveloperSearchPage;
