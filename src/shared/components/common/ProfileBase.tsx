import BookmarkIcon from '@assets/icons/bookmark.svg?react';
import BookmarkFilled from '@assets/icons/bookmark-filled.svg?react';
import { cn } from '@libs/cn';
import { badgeToneToClass } from '../../types/badgeTone';
import type { ProfileCardProps, TechStackItem } from '../../types/profileCard.types';

type BadgeListProps = {
  badges?: ProfileCardProps['badges'];
  className?: string;
};

export function HeaderBlock({
  role,
  roleTone,
  nickname,
  profileImageUrl,
  profileImageAlt,
  bookmarked = false,
  onBookmarkChange,
  id,
  avatarClass,
  titleClass,
  roleClass,
}: Pick<
  ProfileCardProps,
  | 'role'
  | 'roleTone'
  | 'nickname'
  | 'profileImageUrl'
  | 'profileImageAlt'
  | 'bookmarked'
  | 'onBookmarkChange'
  | 'id'
> & {
  avatarClass: string;
  titleClass: string;
  roleClass: string;
}) {
  return (
    <div className="flex items-start gap-6">
      <img
        src={profileImageUrl}
        alt={profileImageAlt ?? nickname}
        className={cn(avatarClass, 'shrink-0 rounded-full object-cover ring-2 ring-white/40')}
        loading="lazy"
      />

      <div className="min-w-0">
        {role && roleTone && (
          <span
            className={cn(
              'inline-flex w-fit items-center whitespace-nowrap rounded-lg px-3 py-1 font-semibold',
              roleClass,
              badgeToneToClass[roleTone],
            )}
          >
            {role}
          </span>
        )}

        <div className={cn('mt-2 truncate text-card-title', titleClass)}>{nickname}</div>
      </div>

      <button
        type="button"
        aria-pressed={bookmarked}
        onClick={() => onBookmarkChange?.(!bookmarked, id)}
        className="ml-auto cursor-pointer self-start p-1 hover:opacity-80"
      >
        {bookmarked ? (
          <BookmarkFilled aria-hidden="true" className="h-10 w-10 text-card-muted" />
        ) : (
          <BookmarkIcon aria-hidden="true" className="h-10 w-10 text-card-muted" />
        )}
      </button>
    </div>
  );
}

type BadgeProps = {
  label: string;
};

export function Badge({ label }: BadgeProps) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-xl bg-badge-bg-gray px-4 py-2 font-semibold text-[10px] text-badge-text-gray">
      {label}
    </span>
  );
}

export function BadgeList({ badges, className }: BadgeListProps) {
  if (!badges?.length) return null;

  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {badges.map(({ id, label }) => (
        <Badge key={id ?? label} label={label} />
      ))}
    </div>
  );
}

export function Intro({ introduction }: { introduction?: string }) {
  if (!introduction) return null;

  return <p className="line-clamp-2 text-card-text text-lg leading-relaxed">{introduction}</p>;
}

export function TechChips({ techStack, max }: { techStack?: TechStackItem[]; max: number }) {
  if (!techStack?.length) return null;

  const shown = techStack.slice(0, max);
  const rest = Math.max(techStack.length - max, 0);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {shown.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-2 rounded-3xl border border-card-border bg-surface-tab px-4 py-1"
        >
          {s.icon}
          <span className="font-medium text-base text-card-text">{s.name}</span>
        </div>
      ))}

      {rest > 0 && <span className="font-semibold text-card-muted text-lg">+{rest}</span>}
    </div>
  );
}
