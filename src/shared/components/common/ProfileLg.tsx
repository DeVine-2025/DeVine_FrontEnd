import BookmarkIcon from '@assets/icons/bookmark.svg?react';
import { cn } from '@libs/cn';
import { badgeToneToClass } from '../../types/badgeTone';
import type { ProfileCardProps } from '../../types/profileCard.types';
import { BadgeList, Intro, TechChips } from './ProfileBase';

export default function ProfileCardLg(props: ProfileCardProps) {
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
    action,
    className,
  } = props;

  return (
    <article
      className={cn('rounded-2xl border border-card-border bg-card-bg', 'card-size-lg', className)}
    >
      <div className="flex h-full items-start gap-8">
        <img
          src={profileImageUrl}
          alt={profileImageAlt ?? nickname}
          className={cn(
            'card-avatar-sm',
            'shrink-0 rounded-full object-cover ring-2 ring-white/10',
          )}
          loading="lazy"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {role && roleTone && (
            <span
              className={cn(
                'inline-flex w-fit items-center whitespace-nowrap rounded-lg px-3 py-1 font-semibold text-base',
                badgeToneToClass[roleTone],
              )}
            >
              {role}
            </span>
          )}

          <div className="truncate pl-1 font-semibold text-2xl text-card-title">{nickname}</div>

          <BadgeList badges={badges} className="gap-4" />

          <Intro introduction={introduction} />
        </div>

        <div className="flex h-full w-[240px] items-center">
          <TechChips techStack={techStack} max={5} />
        </div>

        <div className="ml-auto flex h-full items-center pr-5">
          {action ?? (
            <button
              type="button"
              aria-pressed={bookmarked}
              onClick={() => onBookmarkChange?.(!bookmarked, id)}
              className="inline-flex"
            >
              <BookmarkIcon
                aria-hidden="true"
                className="h-10 w-10 cursor-pointer text-card-muted"
              />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
