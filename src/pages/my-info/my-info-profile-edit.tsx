import {useNavigate} from 'react-router-dom';

import BackIcon from "@assets/icons/back.svg?react";
import PlusIcon from "@assets/icons/plus.svg?react";
import ImagePreview from '@components/profileDetail/ImagePreview';

const MyInfoProfileEdit = () => {
  const navigate = useNavigate();

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
            <div className="relative">
              <ImagePreview isExist={false} className="w-40 h-40"/>
              <button type="button" className="absolute "><PlusIcon className={""}/> </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default MyInfoProfileEdit;