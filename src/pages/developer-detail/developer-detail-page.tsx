import type { Contribution } from '@apis/myInfo/myInfo';
import type { TechstackDto } from '@t/profileCard.types';
import type { ChatRoomsListData } from '@t/chat';
import { myInfoQueries } from '@apis/myInfo/my-info.queries';
import { reportQueries } from '@apis/report/report-queries';
import TalkBalloonIcon from '@assets/icons/detail-page/talkBalloon.svg?react';
import { matchingSamples } from '@components/myProject/matching-samples';
import ContactCard from '@components/profileDetail/ContactCard';
import { useAuth } from '@clerk/clerk-react';
import { CHAT_ROOMS_QUERY_KEY } from '@hooks/useChatRooms';
import { useChatWidgetStore } from '@store/chatWidget';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMockData } from '../../shared/config/data-mode';
import { recommendedDevelopers } from '../home/home-mock-data';
import { getSampleTeamDevelopers, sampleTeamProjects } from '../recommend/recommendation-team-samples';
import ProfileDetail from '../../shared/templates/profileDetail';

const DeveloperDetailPage = () => {
  const { memberNick } = useParams<{ memberNick: string }>();
  const [searchParams] = useSearchParams();
  const sampleDeveloper = useMemo(() => {
    if (!useMockData || searchParams.get('preview') !== 'sample') return null;
    const team = sampleTeamProjects.flatMap(project => getSampleTeamDevelopers(project.projectId)).find(item => item.nickname === memberNick);
    const home = recommendedDevelopers.find(item => item.name === memberNick);
    const applicant = matchingSamples.find(item => item.name === memberNick);
    if (!team && !home && !applicant) return null;
    return { nickname: memberNick!, introduction: team?.introduction ?? home?.introduction ?? '', skills: team?.techStack.map(item => item.name) ?? home?.skills ?? [] };
  }, [memberNick, searchParams]);
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const { data: myInfo } = useQuery(myInfoQueries.profile());
  const [year, setYear] = useState(new Date().getFullYear());
  const [isMine, setIsMine] = useState<boolean>(false);

  useEffect(() => {
    if(myInfo?.result?.member?.nickname === memberNick){
      setIsMine(true)
    }
  }, []);


  const enabled = Boolean(memberNick) && !sampleDeveloper;
  const navigate = useNavigate();


  const { data: profileRes } = useQuery({
    ...myInfoQueries.memberProfile(memberNick!),
    enabled,
  });
  const { data: techStackRes } = useQuery({
    ...myInfoQueries.getMemberTechStacks(memberNick!),
    enabled,
  });
  const { data: contributionsRes } = useQuery({
    ...myInfoQueries.getMemberGitContributions(memberNick!, year),
    enabled,
  });
  const { data: reportsRes } = useQuery({
    ...reportQueries.getMemberReports({ nickname: memberNick! }),
    enabled,
  });
  const {
    data: gitRepos,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...myInfoQueries.memberReposInfinite(memberNick!),
    enabled,
  });

  const profile = sampleDeveloper ? { member: { name: sampleDeveloper.nickname, nickname: sampleDeveloper.nickname, address: '', disclosure: true, proposalAlarm: false, mainType: 'DEVELOPER', imageUrl: '', body: sampleDeveloper.introduction, used: 'ACTIVE', createdAt: '' }, domains: [], contacts: [] } : profileRes?.result;
  const techStackForProfile = useMemo(() => {
    if (sampleDeveloper) return sampleDeveloper.skills.map((name, techstackId) => ({ techstackId, name, genre: 'skill', source: 'MANUAL' as const }));
    const list = techStackRes?.result?.techstacks;
    if (!Array.isArray(list)) return [];
    return list as TechstackDto[];
  }, [techStackRes, sampleDeveloper]);
  const contributionsData = useMemo((): Contribution[] => {
    const result = contributionsRes?.result;
    if (Array.isArray(result)) return result as Contribution[];
    const list =
      result && typeof result === 'object' && 'contributionList' in result
        ? (result as { contributionList: Contribution[] }).contributionList
        : undefined;
    return Array.isArray(list) ? list : [];
  }, [contributionsRes]);
  const reports = reportsRes?.result?.content ?? [];

  const nickname = profile?.member?.nickname || profile?.member?.name || '닉네임';

  const handleContactClick = useCallback(() => {
    if (!isSignedIn) {
      window.alert('로그인 후 이용해 주세요.');
      return;
    }
    const clerkId = profile?.clerkId?.trim();
    if (!clerkId) {
      window.alert('채팅을 시작할 수 없어요. 회원 정보가 아직 연결되지 않았습니다.');
      return;
    }
    const rooms = queryClient.getQueryData<ChatRoomsListData>(CHAT_ROOMS_QUERY_KEY)?.rooms ?? [];
    const existing = rooms.find((room) => room.otherMember.clerkId === clerkId);
    if (existing) {
      useChatWidgetStore.getState().requestOpenRoom(existing.roomId);
      return;
    }
    useChatWidgetStore.getState().requestOpenDraft({
      targetClerkId: clerkId,
      nickname: profile?.member?.nickname || profile?.member?.name || undefined,
      image: profile?.member?.imageUrl ?? null,
    });
  }, [isSignedIn, profile?.clerkId, profile?.member?.imageUrl, profile?.member?.name, profile?.member?.nickname, queryClient]);

  useEffect(() => {
    // if(me?.memberId == profileRes)
  }, []);

  return (
    <div className="flex flex-col">
      {sampleDeveloper && <p className="mx-auto desktop-content w-[var(--desktop-content-width,100%)] max-w-[1180px] px-5 pb-6 text-sm text-[var(--text-secondary)]">화면 확인을 위한 예시 개발자 프로필입니다.</p>}
      <div className="mx-auto flex desktop-content w-[var(--desktop-content-width,100%)] max-w-[1180px] justify-between px-5 pb-20 lg:max-2xl:gap-6 lg:max-2xl:pb-14">
        <ProfileDetail
          isSample={!!sampleDeveloper}
          type="개발자 상세"
          profile={profile}
          techStack={techStackForProfile}
          contributions={contributionsData}
          year={year}
          onYearChange={setYear}
          isOwner={"others"}
          gitRepos={gitRepos}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          reports={reports}
          memberNick={memberNick}
        />
        {!isMine && !sampleDeveloper && <div
          className="sticky top-8 flex h-fit flex-1/3 flex-col gap-[1.2rem] self-start rounded-2xl border border-ui-200 bg-ui-bg p-[2.4rem] lg:max-2xl:p-[18px]">
          <p className="font-semibold text-2xl text-ui-900">
            {nickname}님에게 <br />
            나의 프로젝트를 제안해보세요!
          </p>
          <ContactCard />
          <button
            type="button"
            onClick={handleContactClick}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-ui-100 py-[1.4rem] text-xl font-medium text-ui-500"
          >
            <TalkBalloonIcon /> 연락하기
          </button>
          <button
            type="button"
            onClick={() => {
              navigate(`/developer-detail/${memberNick}/suggest`, {
                state: { profileData: profileRes }
              });
            }}
            className="w-full cursor-pointer justify-center rounded-xl bg-primary py-[1.4rem] font-medium text-white text-xl"
          >
            제안하기
          </button>
        </div>}
      </div>
    </div>
  );
};

export default DeveloperDetailPage;
