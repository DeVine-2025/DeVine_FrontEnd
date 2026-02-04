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


type ProfileDetailProps = {
  type: '내 정보' | '개발자 상세';
}

const gitDummy = [
  { date: '2026-01-05', count: 12 },
  { date: '2026-01-06', count: 5 },
  { date: '2026-02-14', count: 8 },
  // ... 활동이 없는 날은 생략 가능
];

const ProfileDetail = ({type}: ProfileDetailProps) => {

  return (
    <section className="mx-auto w-full max-w-[1180px] flex justify-between">
      <div className="max-w-[718px] flex-col gap-14">
        {/*Section 1*/}
        <div className="flex gap-[2.4rem]">
          <ImagePreview isExist={false} />
          <div className="w-full flex flex-col gap-[0.8rem]">
            <RoleChips roleTone={'green'} role={'백엔드'} />
            <p className="text-4xl font-bold text-ui-1000 mb-[0.8rem]">닉네임</p>
            <p className="flex items-center gap-[0.4rem] text-xl font-medium text-ui-400"><HeartIcon />관심 도메인</p>
            <div className="flex-col gap-[1.4rem]">
              <DomainBadges label={'플랫폼'} />
              <NormalButton label={'프로필 수정'} />
            </div>
          </div>
        </div>

        {/* Section 2 : 자기소개 */}
        <div className="flex justify-between w-full pr-[10.4rem]">
          <p className="Label1 text-ui-500 font-medium">
            소개가 들어가는 자리 입니다.
          </p>
          <div>
            <ContactCard />
          </div>
        </div>
        <hr className="border-ui-200" />

        {/* Section 3 : 보유 스택 목록 */}
        <div className="flex-col gap-[2.4rem]">
          <p className="text-ui-800 text-3xl font-bold flex items-center gap-[0.8rem]">보유 스택
            <button type="button" className="border border-2 border-ui-200 bg-ui-50 rounded-full">
              <QuestionIcon className="text-ui-200" />
            </button>
          </p>
          <TechStackChips techStack={['typescript', 'typescript', 'typescript', 'springboot']} />
        </div>

        {/* Section 4 : 깃허브 기록 */}
        <div>
          <p className="text-ui-800 text-3xl font-bold flex items-center gap-[0.8rem] mb-[2.4rem]">깃허브 기록</p>
          <div className="flex-col gap-[1.5rem]">
            <CustomGithubCalendar data={gitDummy} />
            <div className="flex gap-[1.8rem]">
              <ReportCardSmall title={"레포1"} description={"레포 1입니다."} />
              <ReportCardSmall title={"레포2"} description={"레포 2입니다."} />
              <ReportCardSmall title={"레포3"} description={"레포 3입니다."} />
            </div>
          </div>
        </div>

        {/* Section 5 : 리포트 */}
        <div>
          <p className="text-ui-800 text-3xl font-bold flex items-center gap-[0.8rem] mb-[2.4rem]">리포트</p>
          <div className="flex gap-[1.8rem]">
            <ReportCardSmall label={"메인"} title={"레포1"} description={"레포 1입니다."} />
            <ReportCardSmall label={"메인"} title={"레포2"} description={"레포 2입니다."} />
            <ReportCardSmall label={"메인"} title={"레포3"} description={"레포 3입니다."} />
          </div>
        </div>

        {/* Section 6 : 내프로젝트 */ }
        <div>
          <p className="text-ui-800 text-3xl font-bold flex items-center gap-[0.8rem] mb-[2.4rem]">내 프로젝트</p>
          <div className="flex gap-[1.8rem]">
            <ReportCardSmall label={"메인"} title={"레포1"} description={"레포 1입니다."} />
            <ReportCardSmall label={"메인"} title={"레포2"} description={"레포 2입니다."} />
            <ReportCardSmall label={"메인"} title={"레포3"} description={"레포 3입니다."} />
          </div>
        </div>
      </div>

    </section>
  );
};

export default ProfileDetail;