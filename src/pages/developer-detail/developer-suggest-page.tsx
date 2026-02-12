import BackIcon from "@assets/icons/back.svg?react";
import ImagePreview from '@components/profileDetail/ImagePreview';
import { BadgeList } from '@components/common/ProfileBase';
import { TechChips } from '@components/common/ProfileBase';

import { useNavigate, useParams, useLocation } from 'react-router-dom';
import type { MyProfile } from '@apis/myInfo/myInfo';
import { DOMAIN_REVERSE_MAP } from '@constants/domain';
import { useMemo } from 'react';
import RoleChips from '@components/profileDetail/RoleChips';

const DeveloperSuggestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { memberNick } = useParams<{ memberNick: string }>();
  
  // navigate state로 전달된 프로필 데이터 가져오기
  const profileData = location.state?.profileData as { result?: MyProfile } | undefined;
  const profile = profileData?.result;
  
  // domains를 영어에서 한글로 변환
  const koreanDomains = useMemo(() => {
    const domains = profile?.domains ?? [];
    return domains.map((domain) => DOMAIN_REVERSE_MAP[domain] ?? domain);
  }, [profile?.domains]);
  console.log(profile)
  return (
    <div>

      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-[2rem]">
        <div className="flex flex-col gap-[2.4rem]">
          <BackIcon className="h-12 w-12 cursor-pointer text-ui-700" onClick={() => navigate(-1)} />
          <p className="font-bold text-4xl text-ui-900">프로젝트를 선택해 <br />[{memberNick}]님에게 매칭을 제안하세요!</p>
        </div>
        <div className="flex p-[2.4rem] bg-ui-bg rounded-3xl border border-ui-200 w-fit gap-10">
          <div>
            <ImagePreview isExist={profile?.member?.imageUrl !== undefined} imageUrl={profile?.member?.imageUrl} />
          </div>
          <div className="flex-col gap-2">
            <RoleChips roleTone={profile?.member?.mainType === "DEVELOPER" ? "green" : "blue"}
                       role={profile?.member?.mainType === "DEVELOPER" ? "개발자" : "PM"} />
            <p className="text-ui-1000 text-lg font-semibold">{profile?.member?.nickname}</p>
            <div className="flex gap-3 items-center">
              {koreanDomains.map((item, index) => (
                <p key={index}
                   className="text-ui-600 text-l font-semibold  bg-ui-100 rounded-lg px-2 py-1 w-fit">{item}</p>
              ))}
            </div>
            <p className="text-ui-600 text-l font-normal">{profile?.member?.body}</p>
          </div>
        </div>
        <hr className="h-[6px] border-ui-100" />
        <div>
          <p className="text-ui-1000 text-3xl font-bold">나의 프로젝트</p>
        </div>
        <div className="flex-col gap-[2.2rem]">
          <p className="text-ui-1000 text-3xl font-bold">제안 내용</p>
          <textarea
            placeholder="제안 내용을 입력해주세요."
            className="w-full h-72 bg-ui-50 rounded-2xl p-4 align-top resize-none p-[2.4rem] placeholder:text-ui-500 placeholder:text-lg placeholder:font-semibold"
          />

        </div>
        <div className="w-full flex items-end justify-end">
        <button className="rounded-xl bg-primary px-40 py-4 text-white text-lg font-medium">제안하기</button>
        </div>
      </div>

    </div>
  );
};

export default DeveloperSuggestPage;