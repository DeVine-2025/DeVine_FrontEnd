import BookmarkIcon from '@assets/icons/bookmark.svg?react';
import BookmarkFilled from '@assets/icons/bookmark-filled.svg?react';
import { cn } from '@libs/cn';
import { badgeToneToClass } from 'src/shared/types/badgeTone';
import type { ProfileCardProps } from 'src/shared/types/profileCard.types';
import { BadgeList, TechChips } from '@components/common/ProfileBase';

type MainProfileCardProps = ProfileCardProps & {
  matchReason?: string;
};

export default function MainProfileCard(props: MainProfileCardProps) {
  const borderGradient =
    'linear-gradient(90deg, var(--color-main-profile-border-start) 0%, var(--color-main-profile-border-mid) 50%, var(--color-main-profile-border-end) 100%)';
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
    matchReason,
  } = props;

  return (
    <div
      className={cn('w-full rounded-2xl p-[1px]', className)}
      style={{
        backgroundImage: borderGradient,
      }}
    >
      <article className="w-full rounded-2xl bg-card-bg px-8 py-6">
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

          <div className="truncate pl-1 font-semibold text-2xl text-card-title">
            {nickname}
          </div>

          <BadgeList badges={badges} className="gap-4" />

          {introduction && (
            <p className="line-clamp-2 text-lg leading-relaxed text-card-muted">
              {introduction}
            </p>
          )}

          {matchReason && (
            <div
              className="rounded-2xl px-4 py-3 text-[14px]"
              style={{
                backgroundColor: 'var(--color-main-profile-match-bg)',
                color: 'var(--color-main-profile-match-text)',
              }}
            >
              <span className="font-semibold text-[var(--badge-text-primary)]">
                [A 프로젝트]
              </span>{' '}
              {matchReason}
            </div>
          )}
        </div>

        <div className="flex h-full w-[240px] items-center">
          <TechChips techStack={techStack} max={5} />
        </div>

        <button
          type="button"
          aria-pressed={bookmarked}
          onClick={() => onBookmarkChange?.(!bookmarked, id)}
          className="ml-auto flex h-full cursor-pointer items-center pr-5 hover:opacity-80"
        >
          {bookmarked ? (
            <BookmarkFilled aria-hidden="true" className="h-10 w-10 text-card-muted" />
          ) : (
            <BookmarkIcon aria-hidden="true" className="h-10 w-10 text-card-muted" />
          )}
        </button>
        </div>
      </article>
    </div>
  );
}
