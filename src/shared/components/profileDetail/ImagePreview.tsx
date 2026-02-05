import ProfileDefaultIcon from '@assets/icons/profile-default.svg?react';
// import DummyImage from "@assets/images/dummyImage.jpg";

import {cn} from '@libs/cn';

type ImagePreviewProps = {
  isExist: boolean;
  className?: string;
}

const ImagePreview = ({isExist, className}: ImagePreviewProps) => {
  return (
    <div className={cn('bg-ui-100 shrink-0 border border-ui-200 overflow-hidden rounded-full w-24 h-24 flex-col-center', className)}>
      {isExist ?
        <img alt="profile" className="w-full h-full object-cover"/>
        : <ProfileDefaultIcon className="text-[var(--ui-bg)] w-15 h-15 m-6"/>
      }
    </div>
  );
};

export default ImagePreview;