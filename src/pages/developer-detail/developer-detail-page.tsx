import { isChatApiError } from '@apis/chat';
import type { Contribution } from '@apis/myInfo/myInfo';
import type { TechstackDto } from '@t/profileCard.types';
import type { ChatRoomsListData } from '@t/chat';
import { myInfoQueries } from '@apis/myInfo/myInfo-queries';
import { reportQueries } from '@apis/report/report-queries';
import TalkBalloonIcon from '@assets/icons/detail-page/talkBalloon.svg?react';
import ContactCard from '@components/profileDetail/ContactCard';
import { useAuth } from '@clerk/clerk-react';
import { CHAT_ROOMS_QUERY_KEY } from '@hooks/useChatRooms';
import { useCreateOrGetChatRoom } from '@hooks/useCreateOrGetChatRoom';
import { useChatWidgetStore } from '@store/chatWidget';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProfileDetail from '../../shared/templates/profileDetail';

const DeveloperDetailPage = () => {
  const { memberNick } = useParams<{ memberNick: string }>();
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const createRoomMutation = useCreateOrGetChatRoom();
  const { data: myInfo } = useQuery(myInfoQueries.profile());
  const [year, setYear] = useState(new Date().getFullYear());
  const [isMine, setIsMine] = useState<boolean>(false);

  useEffect(() => {
    if(myInfo?.result?.member?.nickname === memberNick){
      setIsMine(true)
    }
  }, []);


  const enabled = Boolean(memberNick);
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

  const profile = profileRes?.result;
  const techStackForProfile = useMemo(() => {
    const list = techStackRes?.result?.techstacks;
    if (!Array.isArray(list)) return [];
    return list as TechstackDto[];
  }, [techStackRes]);
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

  const handleContactClick = useCallback(async () => {
    if (!isSignedIn) {
      window.alert('로그인 후 이용해 주세요.');
      return;
    }
    const clerkId = profile?.member?.clerkId?.trim();
    if (!clerkId) {
      window.alert('채팅을 시작할 수 없어요. 회원 정보가 아직 연결되지 않았습니다.');
      return;
    }
    try {
      const room = await createRoomMutation.mutateAsync({ targetClerkId: clerkId });
      queryClient.setQueryData<ChatRoomsListData>(CHAT_ROOMS_QUERY_KEY, (prev) => {
        const rooms = prev?.rooms ?? [];
        const summary = {
          roomId: room.roomId,
          lastMessage: null,
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
          otherMember: room.otherMember,
        };
        return {
          rooms: [summary, ...rooms.filter((r) => r.roomId !== summary.roomId)],
        };
      });
      useChatWidgetStore.getState().requestOpenRoom(room.roomId);
    } catch (e) {
      const msg = isChatApiError(e)
        ? e.message
        : e instanceof Error
          ? e.message
          : '채팅방을 열 수 없어요.';
      window.alert(msg);
    }
  }, [createRoomMutation, isSignedIn, profile?.member?.clerkId, queryClient]);

  useEffect(() => {
    // if(me?.memberId == profileRes)
  }, []);
  return (
    <div className="flex">
      <div className="mx-auto flex w-full max-w-[1180px] justify-between px-5 pb-20">
        <ProfileDetail
          type="개발자 상세"
          profile={profile}
          techStack={techStackForProfile}
          contributions={contributionsData}
          year={year}
          onYearChange={setYear}
          gitRepos={gitRepos}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          reports={reports}
          memberNick={memberNick}
        />
        {!isMine && <div
          className="sticky top-8 flex h-fit flex-1/3 flex-col gap-[1.2rem] self-start rounded-2xl border border-ui-200 bg-ui-bg p-[2.4rem]">
          <p className="font-semibold text-2xl text-ui-900">
            {nickname}님에게 <br />
            나의 프로젝트를 제안해보세요!
          </p>
          <ContactCard />
          <button
            type="button"
            disabled={createRoomMutation.isPending}
            onClick={() => {
              void handleContactClick();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-ui-100 py-[1.4rem] text-xl font-medium text-ui-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <TalkBalloonIcon /> {createRoomMutation.isPending ? '연결 중…' : '연락하기'}
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
