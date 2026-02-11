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
import { useMemo, useState } from 'react';

import type { Contribution, MyProfile } from '@apis/myInfo/myInfo';

type ProfileDetailProps = {
  type: '내 정보' | '개발자 상세',
  profile?: MyProfile,
  techStack?: string[],
  contributions?: Contribution[],
  year?: number
  onYearChange?: (year: number) => void
}

const gitDummy = [
  { date: '2026-01-05', count: 12 },
  { date: '2026-01-06', count: 5 },
  { date: '2026-02-14', count: 8 }
  // ... 활동이 없는 날은 생략 가능
];

const ProfileDetail = ({ type, profile, techStack, contributions, year, onYearChange }: ProfileDetailProps) => {
  const [projectTab, setProjectTab] = useState<ProjectTab>('ongoing');

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
    () => (domains.length > 0 ? domains : ['도메인 미등록']),
    [domains]
  );
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
              <NormalButton label={'프로필 수정'} onClick={() => navigate('/profile-edit')} />
            </div>
          </div>
        </div>

        {/* Section 2 : 자기소개 */}
        <div className="flex justify-between w-full pr-[10.4rem]">
          <p className="Label1 text-ui-500 font-medium">
            {introduction}
          </p>
          <div>
            <ContactCard contacts={contacts} />
          </div>
        </div>
        <hr className="border-ui-200" />

        {/* Section 3 : 보유 스택 목록 */}
        <div className="flex-col gap-[2.4rem]">
          <p className="text-ui-800 text-3xl font-bold flex items-center gap-[0.8rem]">보유 스택
            <button type="button" className="border-2 border-ui-200 bg-ui-50 rounded-full cursor-pointer">
              <QuestionIcon className="text-ui-200 w-5 h-5" />
            </button>
          </p>
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
            <div className="flex gap-[1.8rem]">
              <ReportCardSmall title={'레포1'} description={'레포 1입니다.'} />
              <ReportCardSmall title={'레포2'} description={'레포 2입니다.'} />
              <ReportCardSmall title={'레포3'} description={'레포 3입니다.'} />
            </div>
          </div>
        </div>

        <div className="w-full">
          <MyPMBottomSection projectTab={projectTab} onChangeProjectTab={setProjectTab} />
        </div>
      </div>

    </section>
  );
};

export default ProfileDetail;