import ImagePreview from '@components/profileDetail/ImagePreview';
import RoleChips from '@components/profileDetail/RoleChips';
import HeartIcon from '@assets/icons/heart.svg?react';

type ProfileDetailProps = {
  type: '내 정보' | '개발자 상세';
}

const ProfileDetail = ({type}: ProfileDetailProps) => {
  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-14">
      <div className="flex gap-[2.4rem]">
        <ImagePreview isExist={false}/>
        <div>
          <RoleChips roleTone={'green'} role={'백엔드'}/>
          <p className="text-4xl font-bold font-ui-1000 ">닉네임</p>
          <p className="flex items-center gap-4 text-base font-medium"><HeartIcon/>관심 도메인</p>
        </div>

      </div>
    </section>
  );
};

export default ProfileDetail;