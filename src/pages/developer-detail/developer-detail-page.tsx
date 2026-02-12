import { useParams, useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import ProfileDetail from '../../shared/templates/profileDetail';
import ContactCard from '@components/profileDetail/ContactCard';
import TalkBalloonIcon from '@assets/icons/detail-page/talkBalloon.svg?react';

import type { Contribution } from '@apis/myInfo/myInfo';
import { myInfoQueries } from '@apis/myInfo/myInfo-queries';
import { reportQueries } from '@apis/report/report-queries';

const DeveloperDetailPage = () => {
  const { memberNick } = useParams<{ memberNick: string }>();
  const [year, setYear] = useState(new Date().getFullYear());

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
  const techStackNames = useMemo(() => {
    const list = techStackRes?.result?.techstacks;
    if (!Array.isArray(list)) return [];
    return list.map((item: { name: string }) => item.name);
  }, [techStackRes]);
  const contributionsData = useMemo((): Contribution[] => {
    const result = contributionsRes?.result;
    if (Array.isArray(result)) return result as Contribution[];
    const list = result && typeof result === 'object' && 'contributionList' in result
      ? (result as { contributionList: Contribution[] }).contributionList
      : undefined;
    return Array.isArray(list) ? list : [];
  }, [contributionsRes]);
  const reports = reportsRes?.result?.reports ?? [];

  const nickname = profile?.member?.nickname || profile?.member?.name || '닉네임';

  return (
    <div className="flex">
      <div className="mx-auto w-full flex justify-between max-w-[1180px]">
        <ProfileDetail
          type="개발자 상세"
          profile={profile}
          techStack={techStackNames}
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
        <div className="sticky top-8 self-start flex-1/3 bg-ui-bg rounded-2xl border border-ui-200 flex flex-col gap-[1.2rem] p-[2.4rem] h-fit">
          <p className="text-ui-900 text-2xl font-semibold">
            {nickname}님에게 <br />
            나의 프로젝트를 제안해보세요!
          </p>
          <ContactCard />
          {/*<button*/}
          {/*  type="button"*/}
          {/*  className="flex items-center w-full justify-center gap-2 bg-ui-100 rounded-xl text-ui-500 py-[1.4rem] text-xl font-medium"*/}
          {/*>*/}
          {/*  <TalkBalloonIcon /> 연락하기*/}
          {/*</button>*/}
          <button
            type="button"
            onClick={() => {
              navigate(`/developer-detail/${memberNick}/suggest`, {
                state: { profileData: profileRes },
              });
            }}
            className="cursor-pointer bg-primary rounded-xl text-white text-xl font-medium w-full justify-center py-[1.4rem]"
          >
            제안하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDetailPage;
