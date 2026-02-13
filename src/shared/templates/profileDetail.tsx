import { createBookmark, deleteBookmark, getBookmarks } from '@apis/bookmarks';
import type { Contribution, MyProfile, MyReposResponse } from '@apis/myInfo/myInfo';
import type { ReportCard } from '@apis/report/report';
import HeartIcon from '@assets/icons/heart.svg?react';
import QuestionIcon from '@assets/icons/question.svg?react';
import { useAuth } from '@clerk/clerk-react';
import MyPMBottomSection, { type ProjectTab } from '@components/myProject/MyBottomSection';
import ContactCard from '@components/profileDetail/ContactCard';
import CustomGithubCalendar from '@components/profileDetail/CustomGithubCalendar';
import DomainBadges from '@components/profileDetail/DomainBadges';
import ImagePreview from '@components/profileDetail/ImagePreview';
import NormalButton from '@components/profileDetail/NormalButton';
import ReportCardSmall from '@components/profileDetail/ReportCardSmall';
import TechStackChips from '@components/profileDetail/TechStackChips';
import { DOMAIN_REVERSE_MAP } from '@constants/domain';
import type { InfiniteData } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type ProfileDetailProps = {
  type: '내 정보' | '개발자 상세';
  profile?: MyProfile;
  techStack?: string[];
  contributions?: Contribution[];
  year?: number;
  onYearChange?: (year: number) => void;
  gitRepos?: InfiniteData<MyReposResponse> | undefined;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  reports?: ReportCard[];
  memberNick?: string;
};

const ProfileDetail = ({
  type,
  profile,
  techStack,
  contributions,
  year,
  onYearChange,
  gitRepos,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  reports = [],
  memberNick,
}: ProfileDetailProps) => {
  const [projectTab, setProjectTab] = useState<ProjectTab>('ongoing');
  const [isHover, setIsHover] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { getToken } = useAuth();
  const member = profile?.member;
  const nickname = member?.nickname || member?.name || '닉네임';
  const domains = profile?.domains ?? [];
  const contacts = profile?.contacts ?? [];
  const introduction = member?.body || '소개가 들어가는 자리 입니다.';
  const imageUrl = member?.imageUrl ?? null;
  const hasImage = Boolean(imageUrl);
  const targetNickname = memberNick ?? member?.nickname ?? '';
  const [bookmarkId, setBookmarkId] = useState<number | null>(null);
  const isDetail = type === '개발자 상세';
  const isBookmarked = isDetail && bookmarkId != null;
  const domainBadges = useMemo(
    () => (domains.length > 0 ? domains.map((d) => DOMAIN_REVERSE_MAP[d] ?? d) : ['도메인 미등록']),
    [domains],
  );

  // 가로 스크롤 무한 로딩 처리
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      const isNearEnd = scrollLeft + clientWidth >= scrollWidth - 100;

      if (isNearEnd && hasNextPage && !isFetchingNextPage && fetchNextPage) {
        fetchNextPage();
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!isDetail) return;
    if (!targetNickname) return;
    let cancelled = false;
    const loadBookmarks = async () => {
      const token = await getToken();
      if (!token || cancelled) return;
      try {
        const bookmarks = await getBookmarks(token);
        if (cancelled) return;
        const hit = bookmarks.find(
          (b) => b.targetType === 'DEVELOPER' && b.targetNickname === targetNickname,
        );
        setBookmarkId(hit?.bookmarkId ?? null);
      } catch (e) {
        console.error('[북마크] 상세 로드 실패', e);
      }
    };
    void loadBookmarks();
    return () => {
      cancelled = true;
    };
  }, [getToken, isDetail, targetNickname]);

  const handleBookmarkChange = async () => {
    if (!isDetail) return;
    if (!targetNickname) return;
    const token = await getToken();
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    const prevId = bookmarkId;
    const next = !isBookmarked;
    if (next) {
      setBookmarkId(-1);
    } else {
      setBookmarkId(null);
    }
    try {
      if (next) {
        const { bookmarkId: nextId } = await createBookmark(
          { targetType: 'DEVELOPER', targetNickname },
          token,
        );
        setBookmarkId(nextId);
      } else {
        if (prevId == null || prevId <= 0) return;
        await deleteBookmark(prevId, token);
      }
    } catch (e) {
      setBookmarkId(prevId ?? null);
      alert(e instanceof Error ? e.message : '북마크 처리에 실패했습니다.');
    }
  };

  console.log(gitRepos?.pages);
  return (
    <section className="mx-auto flex w-full max-w-[1180px] justify-between">
      <div className="max-w-[718px] flex-col gap-14">
        {/*Section 1*/}
        <div className="flex gap-[2.4rem]">
          <ImagePreview isExist={hasImage} imageUrl={imageUrl} />
          <div className="flex w-full flex-col gap-[0.8rem]">
            <p className="mb-[0.8rem] font-bold text-4xl text-ui-1000">{nickname}</p>
            {isDetail ? (
              <button
                type="button"
                onClick={handleBookmarkChange}
                disabled={!targetNickname}
                aria-pressed={isBookmarked}
                className="flex items-center gap-[0.4rem] font-medium text-ui-400 text-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                <HeartIcon className={isBookmarked ? 'text-primary' : 'text-ui-400'} />
                관심 도메인
              </button>
            ) : null}
            <div className="flex-col gap-[1.4rem]">
              <div className="flex flex-wrap gap-[0.8rem]">
                {domainBadges.map((domain) => (
                  <DomainBadges key={domain} label={domain} />
                ))}
              </div>
              {type === '내 정보' && (
                <NormalButton label={'프로필 수정'} onClick={() => navigate('/profile-edit')} />
              )}
            </div>
          </div>
        </div>

        {/* Section 2 : 자기소개 */}
        <div className="flex w-full justify-between pr-[10.4rem]">
          <p className="Label1 min-h-[7rem] font-medium text-ui-500">{introduction}</p>
          {type === '내 정보' && (
            <div>
              <ContactCard contacts={contacts} />
            </div>
          )}
        </div>
        <hr className="border-ui-200" />

        {/* Section 3 : 보유 스택 목록 */}
        <div className="flex-col gap-[2.4rem]">
          <div className="relative">
            <p className="relative flex items-center gap-[0.8rem] font-bold text-3xl text-ui-800">
              보유 스택
              <button
                type="button"
                onMouseOver={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
                className="cursor-pointer rounded-full border-2 border-ui-200 bg-ui-50"
              >
                <QuestionIcon className="h-5 w-5 text-ui-200" />
              </button>
            </p>
            {isHover && (
              <p className="absolute left-30 z-90 inline-flex items-center justify-center gap-2 rounded-xl bg-ui-bg p-[1rem] font-medium text-ui-600 text-xl shadow-[0px_2px_8px_-4px_rgba(0,0,0,0.20)]">
                리포트에 포함된 기술 스택은 하이라이트되어 표시돼요.
              </p>
            )}
          </div>
          <TechStackChips techStack={techStack} />
        </div>

        {/* Section 4 : 깃허브 기록 */}
        <div className="flex flex-col gap-[2.4rem]">
          <p className="flex items-center gap-[0.8rem] font-bold text-3xl text-ui-800">
            깃허브 기록
          </p>
          <div className="flex-col gap-[1.5rem]">
            <CustomGithubCalendar data={contributions} year={year} onYearChange={onYearChange} />
            <div ref={scrollContainerRef} className="flex gap-[1.8rem] overflow-x-auto">
              {gitRepos?.pages?.flatMap((page) =>
                (page.result?.content ?? []).map((repo) => (
                  <ReportCardSmall
                    key={repo.gitRepoId}
                    title={repo.name}
                    description={repo.description}
                  />
                )),
              )}
              {isFetchingNextPage && (
                <div className="flex min-w-64 items-center justify-center">
                  <p className="text-ui-400">로딩 중...</p>
                </div>
              )}
            </div>
          </div>

          {/* 리포트 */}
          {type === '개발자 상세' && (
            <div className="flex flex-col gap-[1.5rem]">
              <p className="font-bold text-3xl text-ui-1000">리포트</p>
              <div className="flex w-full flex-nowrap gap-[1.5rem] overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-ui-200 [&::-webkit-scrollbar]:h-2">
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <div key={report.reportId} className="min-w-64 max-w-64 flex-shrink-0">
                      <ReportCardSmall
                        gitRepoId={report.gitRepoId}
                        label={report.reportType === 'MAIN'
                          ? '메인'
                          : report.reportType === 'DETAIL' || report.reportType === 'SUB'
                            ? '상세'
                            : undefined}
                        title={report.repoName}
                        description={report.repoDescription}
                        reportType={report.reportType}                      />
                    </div>
                  ))
                ) : (
                  <div className="flex min-h-[120px] w-full items-center justify-center rounded-2xl border border-ui-200 bg-ui-50">
                    <p className="text-ui-500">리포트 없음</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-full">
          <MyPMBottomSection
            projectTab={projectTab}
            onChangeProjectTab={setProjectTab}
            memberNick={memberNick}
          />
        </div>
      </div>
    </section>
  );
};

export default ProfileDetail;
