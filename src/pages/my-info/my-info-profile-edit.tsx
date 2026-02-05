import {useNavigate} from 'react-router-dom';
import {useState} from 'react';

import BackIcon from "@assets/icons/back.svg?react";
import PlusNolineIcon from "@assets/icons/plus-noline.svg?react";

import ImagePreview from '@components/profileDetail/ImagePreview';
import MyInfoInput from '@components/myInfo/MyInfoInput';


type MyInfoProfileItemProps = {
  title : string;
  text: string;
  setText: (text: string) => void;
}

const MyInfoProfileItem = ({title, text, setText}: MyInfoProfileItemProps) => {
  return (
    <div className="flex-col gap-[1.6rem]">
      <p className="text-ui-900 text-2xl font-bold">{title}</p>
      <MyInfoInput text={text} setText={setText} />
    </div>
  )
}

const MyInfoProfileEdit = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState<string>('디바인');

  return (
    <div className="mx-auto w-full max-w-[1180px] flex-col gap-[2rem]">
      <div className="flex-col gap-[2.4rem]">
        <BackIcon className="cursor-pointer text-ui-700 w-12 h-12" onClick={() => navigate(-1)} />
        <p className="text-ui-900 text-4xl font-bold">프로필 수정</p>
      </div>
      <div className="w-full flex-col items-center">
        <div className="w-[536px]">
          <p className="text-ui-900 text-2xl font-bold">프로필 사진</p>
          <div className="w-full flex justify-center">
            <div className="relative w-fit">
              <ImagePreview isExist={false} className="w-40 h-40"/>
              <button type="button" className="absolute bg-ui-200 rounded-full right-0 bottom-0"><PlusNolineIcon className="w-10 h-10 p-2 text-white"/> </button>
            </div>
          </div>
          <div>
            <MyInfoProfileItem title={"닉네임"} text={nickname} setText={setNickname} />
            <MyInfoProfileItem title={"한줄 소개"} text={nickname} setText={setNickname} />
            <MyInfoProfileItem title={"이메일"} text={nickname} setText={setNickname} />
            <MyInfoProfileItem title={"링크드인"} text={nickname} setText={setNickname} />
            <MyInfoProfileItem title={"보유스택"} text={nickname} setText={setNickname} />

          </div>

        </div>
      </div>
    </div>
  );
};

export default MyInfoProfileEdit;