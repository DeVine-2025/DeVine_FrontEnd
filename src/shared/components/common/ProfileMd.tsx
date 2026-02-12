import BookmarkButton from '@components/common/BookmarkButton';
import { cn } from '@libs/cn';
import type { ProfileCardProps } from '../../types/profileCard.types';
import { BadgeList, Intro, TechChips } from './ProfileBase';

export default function ProfileCardMd(props: ProfileCardProps) {
  const {
    role: _role,
    roleTone: _roleTone,
    nickname,
    profileImageUrl,
    profileImageAlt,
    id,
    bookmarked = false,
    onBookmarkChange,
    badges,
    introduction,
    techStack,
    className,
    onClick,
  } = props;

  return (
    <article
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn('rounded-2xl border border-card-border bg-card-bg', 'card-size-md', onClick && 'cursor-pointer', className)}
    >
      <div className="flex h-full items-start gap-6">
        <img
          src={profileImageUrl}
          alt={profileImageAlt ?? nickname}
          className={cn(
            'card-avatar-sm',
            'shrink-0 rounded-full object-cover ring-2 ring-white/10',
          )}
          loading="lazy"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="truncate pl-2 font-semibold text-2xl text-card-title">{nickname}</div>

          <BadgeList badges={badges} className="gap-3" />

          <Intro introduction={introduction} />
        </div>

        <div className="flex h-full w-[220px] items-center">
          <TechChips techStack={techStack} max={4} />
        </div>

        <BookmarkButton
          bookmarked={bookmarked}
          onBookmarkChange={(next) => onBookmarkChange?.(next, id)}
          stopPropagation={false}
          className="ml-auto flex h-full items-center"
          iconClassName="h-[32px] w-[32px]"
          colorIconClassName="h-[44px] w-[44px]"
        />
      </div>
    </article>
  );
}
