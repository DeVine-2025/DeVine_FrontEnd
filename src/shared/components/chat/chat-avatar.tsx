import { cn } from '@libs/cn';
const ChatAvatar = ({
  image,
  name,
  className,
}: {
  image?: string | null;
  name: string;
  className: string;
}) => (
  <span
    className={cn(
      'flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold',
      'bg-[rgba(112,85,245,0.16)] text-[#B7A8FF]',
      className,
    )}
  >
    {image ? (
      <img src={image} alt="" className="size-full object-cover" />
    ) : (
      name.trim().slice(0, 1) || '?'
    )}
  </span>
);

export default ChatAvatar;
