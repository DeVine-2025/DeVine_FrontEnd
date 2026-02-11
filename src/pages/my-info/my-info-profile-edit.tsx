import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@libs/cn';

import { DOMAIN_OPTIONS } from '@constants/domain';

import BackIcon from "@assets/icons/back.svg?react";
import PlusNolineIcon from "@assets/icons/plus-noline.svg?react";
import CheckboxCheckedIcon from '@assets/icons/checkbox-checked.svg?react';
import CheckboxUncheckedIcon from '@assets/icons/checkbox-unchecked.svg?react';

import ImagePreview from '@components/profileDetail/ImagePreview';
import MyInfoInput from '@components/myInfo/MyInfoInput';
import StackChips from '@components/myInfo/StackChips';


type MyInfoProfileItemProps = {
  type: 'text' | 'search';
  title: string;
  text?: string;
  placeholder?: string;
  className?: string;
  setText?: (text: string) => void;
}

const MyInfoProfileItem = ({ type, title, text, setText, placeholder, className }: MyInfoProfileItemProps) => {
  return (
    <div className="flex-col gap-[1.6rem]">
      <p className={cn('text-ui-900 text-2xl font-bold', className)}>{title}</p>
      <MyInfoInput text={text} setText={setText} type={type} placeHolder={placeholder} />
    </div>
  )
}

const MyInfoProfileEdit = () => {
  const navigate = useNavigate();

  const [myInfo, setMyInfo] = useState({
    nickname: "",
    email: "",
    linkedIn: "",
    stack: [],
    domain: []
  });

  const [nickname, setNickname] = useState<string>('디바인');
  const [domains, setDomains] = useState<string[]>([]);
  const [stack, setStack] = useState<string[]>(["React"]);

  const toggleDomain = (value: string) => {
    setDomains((prev) => {
      if (prev.indexOf(value) !== -1) {
        return prev.filter((item) => item !== value);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, value];
    });
  };

  const techStack = [
    { id: '1', name: 'React' },
    { id: '2', name: 'TypeScript' },
    { id: '3', name: 'Spring Boot' },
    { id: '4', name: 'AWS' },
  ];


  const handleDeleteStack = (stack: string) => {
    setStack(prev => prev.filter(item => item !== stack));
  };

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
              <ImagePreview isExist={false} className="w-40 h-40" />
              <button type="button" className="absolute bg-ui-200 rounded-full right-0 bottom-0"><PlusNolineIcon className="w-10 h-10 p-2 text-white" /> </button>
            </div>
          </div>
          <div className="flex-col gap-[4.8rem]">
            <MyInfoProfileItem type={'text'} title={'닉네임'} text={nickname} setText={setNickname} />
            <hr className="border-ui-200" />
            <div className="flex-col gap-[2.4rem]">
              <MyInfoProfileItem type={'text'} title={'한줄 소개'} text={nickname} setText={setNickname} />
              <p className="text-ui-1000 text-2xl font-semibold ">연락처</p>
              <MyInfoProfileItem type={'text'} title={'이메일'} text={nickname} setText={setNickname} className="text-ui-600 text-xl font-semibold" />
            </div>

            <div className="flex-col gap-[1.6rem]">
              <MyInfoProfileItem type={'search'} title={'보유 스택'} placeholder={"보유 스택을 검색해주세요"} />
              <div className="flex-col gap-[1.6rem]">
                <StackChips stacks={stack} onRemove={handleDeleteStack} />
                <hr className="border-ui-200" />
              </div>

            </div>

            <div className="flex-col gap-[2.4rem]">
              <p className="flex items-center gap-[0.4rem] text-ui-1000 text-2xl font-semibold ">관심 도메인<span
                className="block text-ui-600 text-base">(최대 3개)</span></p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {DOMAIN_OPTIONS.map((domain) => {
                  const selected = domains.indexOf(domain) !== -1;
                  return (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => toggleDomain(domain)}
                      className="flex items-center gap-3 text-[var(--ui-900)]"
                      aria-pressed={selected}
                    >
                      {selected ? (
                        <CheckboxCheckedIcon className="h-7 w-7 shrink-0 text-[#4E49FF]" aria-hidden="true" />
                      ) : (
                        <CheckboxUncheckedIcon className="h-7 w-7 shrink-0" aria-hidden="true" />
                      )}
                      <span className="Body1">{domain}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              className="w-full cursor-pointer rounded-2xl bg-primary py-[1.6rem] text-2xl text-white font-semibold"
            >
              저장
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default MyInfoProfileEdit;