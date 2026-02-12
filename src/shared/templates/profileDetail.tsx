import HeartIcon from '@assets/icons/heart.svg?react';
import QuestionIcon from '@assets/icons/question.svg?react';

import ImagePreview from '@components/profileDetail/ImagePreview';
import RoleChips from '@components/profileDetail/RoleChips';
import DomainBadges from '@components/profileDetail/DomainBadges';
import NormalButton from '@components/profileDetail/NormalButton';
import ContactCard from '@components/profileDetail/ContactCard';
import TechStackChips from '@components/profileDetail/TechStackChips';
import ReportCardSmall from '@components/profileDetail/ReportCardSmall';
import CustomGithubCalendar from '@components/profileDetail/CustomGithubCalendar';
import MyPMBottomSection, { type ProjectTab } from '@components/myProject/MyBottomSection';

import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useRef, useEffect } from 'react';
import {cn} from '@libs/cn';

import type { Contribution, MyProfile, MyReposResponse } from '@apis/myInfo/myInfo';
import type { ReportCard } from '@apis/report/report';
import { DOMAIN_REVERSE_MAP } from '@constants/domain';
import { InfiniteData } from '@tanstack/react-query';

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
}: ProfileDetailProps) => {
  const [projectTab, setProjectTab] = useState<ProjectTab>('ongoing');
  const [isHover, setIsHover] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const member = profile?.member;
  const role = member?.mainType === 'PM' ? 'PM' : '개발자';
  const roleTone = member?.mainType === 'PM' ? 'blue' : 'green';
  const nickname = member?.nickname || member?.name || '닉네임';
  const domains = profile?.domains ?? [];
  const contacts = profile?.contacts ?? [];
  const introduction = member?.body || '소개가 들어가는 자리 입니다.';
  const imageUrl = member?.imageUrl ?? null;
  const hasImage = Boolean(imageUrl);
  const domainBadges = useMemo(
    () =>
      domains.length > 0
        ? domains.map((d) => DOMAIN_REVERSE_MAP[d] ?? d)
        : ['도메인 미등록'],
    [domains]
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

  console.log(gitRepos?.pages)
  return (
    <section className="mx-auto w-full max-w-[1180px] flex justify-between">
      <div className="max-w-[718px] flex-col gap-14">
        {/*Section 1*/}
        <div className="flex gap-[2.4rem]">
          <ImagePreview isExist={hasImage} imageUrl={imageUrl} />
          <div className="w-full flex flex-col gap-[0.8rem]">
            <RoleChips roleTone={roleTone} role={role} />
            <p className="text-4xl font-bold text-ui-1000 mb-[0.8rem]">{nickname}</p>
            <p className="flex items-center gap-[0.4rem] text-xl font-medium text-ui-400"><HeartIcon />관심 도메인</p>
            <div className="flex-col gap-[1.4rem]">
              <div className="flex flex-wrap gap-[0.8rem]">
                {domainBadges.map((domain) => (
                  <DomainBadges key={domain} label={domain} />
                ))}
              </div>
              {type === "내 정보" && <NormalButton label={'프로필 수정'} onClick={() => navigate('/profile-edit')} />}
            </div>
          </div>
        </div>

        {/* Section 2 : 자기소개 */}
        <div className="flex justify-between w-full pr-[10.4rem]">
          <p className="Label1 text-ui-500 font-medium min-h-[7rem]">
            {introduction}
          </p>
          {type === "내 정보" && <div>
            <ContactCard contacts={contacts} />
          </div>}
        </div>
        <hr className="border-ui-200" />

        {/* Section 3 : 보유 스택 목록 */}
        <div className="flex-col gap-[2.4rem]">
          <div className="relative">
            <p className="text-ui-800 text-3xl font-bold flex items-center gap-[0.8rem] relative">보유 스택
              <button type="button" onMouseOver={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}
                      className="border-2 border-ui-200 bg-ui-50 rounded-full cursor-pointer">
                <QuestionIcon className="text-ui-200 w-5 h-5" />
              </button>
            </p>
            {isHover && <p
              className="absolute z-90 left-30  text-ui-600 text-xl p-[1rem] font-medium  bg-ui-bg rounded-xl shadow-[0px_2px_8px_-4px_rgba(0,0,0,0.20)] inline-flex justify-center items-center gap-2">리포트에
              포함된 기술 스택은 하이라이트되어 표시돼요.</p>}
          </div>
          <TechStackChips techStack={techStack} />
        </div>

        {/* Section 4 : 깃허브 기록 */}
        <div>
          <p className="text-ui-800 text-3xl font-bold flex items-center gap-[0.8rem] mb-[2.4rem]">깃허브 기록</p>
          <div className="flex-col gap-[1.5rem]">
            <CustomGithubCalendar
              data={contributions}
              year={year}
              onYearChange={onYearChange}
            />
            <div ref={scrollContainerRef} className="flex gap-[1.8rem] overflow-x-auto">
              {gitRepos?.pages?.flatMap((page) =>
                (page.result?.content ?? []).map((repo) => (
                  <ReportCardSmall
                    key={repo.gitRepoId}
                    title={repo.name}
                    description={repo.description}
                  />
                ))
              )}
              {isFetchingNextPage && (
                <div className="min-w-64 flex items-center justify-center">
                  <p className="text-ui-400">로딩 중...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {type === '개발자 상세' && reports.length > 0 && (
          <div className="flex flex-col gap-[2.4rem]">
            <p className="text-ui-1000 text-3xl font-bold">리포트</p>
            <div className="flex gap-[1.5rem] overflow-x-auto overflow-y-hidden flex-nowrap w-full [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-ui-200">
              {reports.map((report) => (
                <div key={report.reportId} className="flex-shrink-0 min-w-64 max-w-64">
                  <ReportCardSmall
                    title={report.repoName}
                    description={report.repoDescription}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="w-full">
          <MyPMBottomSection projectTab={projectTab} onChangeProjectTab={setProjectTab} />
        </div>
      </div>

    </section>
  );
};

export default ProfileDetail;