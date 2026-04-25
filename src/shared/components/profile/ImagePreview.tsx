import ProfileDefaultIcon from '@assets/icons/profile-default.svg?react';
import { cn } from '@libs/cn';

type ImagePreviewProps = {
  isExist: boolean;
  imageUrl?: string | null;
  alt?: string;
  className?: string;
};

const ImagePreview = ({ isExist, imageUrl, alt = 'profile', className }: ImagePreviewProps) => {
  const showImage = isExist && Boolean(imageUrl);

  return (
    <div
      className={cn(
        'flex-col-center h-24 w-24 shrink-0 overflow-hidden rounded-full border border-ui-200 bg-ui-100',
        className,
      )}
    >
      {showImage ? (
        <img alt={alt} className="h-full w-full object-cover" src={imageUrl ?? ''} />
      ) : (
        <ProfileDefaultIcon className="m-6 h-15 w-15 text-[var(--ui-bg)]" />
      )}
    </div>
  );
};

export default ImagePreview;
