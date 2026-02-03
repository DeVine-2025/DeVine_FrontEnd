import ProfileDefaultIcon from '@assets/icons/profile-default.svg?react';
import DummyImage from "@assets/images/dummyImage.jpg";

type ImagePreviewProps = {
  isExist: boolean;
}

const ImagePreview = ({isExist}: ImagePreviewProps) => {
  return (
    <div className="bg-[var(--ui-100)] shrink-0 border border-[var(--ui-200)] overflow-hidden rounded-full w-24 h-24 flex-col-center">
      {isExist ?
        <img alt="profile" src={DummyImage} className="w-full h-full object-cover"/>
        : <ProfileDefaultIcon className="text-[var(--ui-bg)] w-15 h-15 m-6"/>
      }
    </div>
  );
};

export default ImagePreview;