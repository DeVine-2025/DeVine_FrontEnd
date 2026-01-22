import BookmarkIcon from '@assets/icons/bookmark.svg?react';
import BookmarkFilled from '@assets/icons/bookmark-filled.svg?react';
import { cn } from '@libs/cn';
import { badgeToneToClass } from '../../types/badgeTone';
import type { ProfileCardProps } from '../../types/profileCard.types';
import { BadgeList, Intro, TechChips } from './ProfileBase';

export default function ProfileCardMd(props: ProfileCardProps) {
  const {
    role,
    roleTone,
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
  } = props;

  return (
    <article
      className={cn('rounded-2xl border border-card-border bg-card-bg', 'card-size-md', className)}
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
          {role && roleTone && (
            <span
              className={cn(
                'inline-flex w-fit items-center whitespace-nowrap rounded-lg px-3 py-1 font-semibold text-sm',
                badgeToneToClass[roleTone],
              )}
            >
              {role}
            </span>
          )}

          <div className="truncate pl-2 font-semibold text-2xl text-card-title">{nickname}</div>

          <BadgeList badges={badges} className="gap-3" />

          <Intro introduction={introduction} />
        </div>

        <div className="flex h-full w-[220px] items-center">
          <TechChips techStack={techStack} max={4} />
        </div>

        <button
          type="button"
          aria-pressed={bookmarked}
          onClick={() => onBookmarkChange?.(!bookmarked, id)}
          className="ml-auto flex h-full cursor-pointer items-center hover:opacity-80"
        >
          {bookmarked ? (
            <BookmarkFilled aria-hidden="true" className="h-9 w-9 text-card-muted" />
          ) : (
            <BookmarkIcon aria-hidden="true" className="h-9 w-9 text-card-muted" />
          )}
        </button>
      </div>
    </article>
  );
}
