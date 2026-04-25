import BookmarkButton from '@ui/BookmarkButton';
import { cn } from '@libs/cn';
import { useThemeStore } from '@store/theme.store';
import { findTechBadge } from '@libs/tech-stack-utils';
import { badgeToneToClass } from '../../types/badge-tone.types';
import type { ProfileCardProps, TechStackItem } from '../../types/profile-card.types';

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
    <div className="relative flex items-start gap-6 p-3">
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

      <BookmarkButton
        bookmarked={bookmarked}
        onBookmarkChange={(next) => onBookmarkChange?.(next, id)}
        stopPropagation={false}
        className="-right-1 absolute top-0"
        iconClassName="h-[30px] w-[30px]"
        colorIconClassName="h-[44px] w-[44px]"
      />
    </div>
  );
}

type BadgeProps = {
  label: string;
};

export function Badge({ label }: BadgeProps) {
  return (
    <span className="Caption1 inline-flex h-[24px] shrink-0 items-center justify-center rounded-[8px] bg-[var(--ui-100)] px-[6px] font-semibold text-[var(--ui-600)]">
      {label}
    </span>
  );
}

export function BadgeList({ badges, className }: BadgeListProps) {
  if (!badges?.length) return null;

  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {badges.map((badge, index) => (
        <Badge key={badge.id ?? `${badge.label}-${index}`} label={badge.label} />
      ))}
    </div>
  );
}

export function Intro({ introduction }: { introduction?: string }) {
  if (!introduction) return null;

  return <p className="line-clamp-2 text-card-text text-lg leading-relaxed">{introduction}</p>;
}

export function TechChips({ techStack, max }: { techStack?: TechStackItem[]; max: number }) {
  const { theme } = useThemeStore();

  if (!techStack?.length) return null;

  const shown = techStack.slice(0, max);
  const rest = Math.max(techStack.length - max, 0);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {shown.map((s, index) => {
        const label = typeof s.name === 'string' ? s.name : '';
        const key = String(s.id ?? index);

        const badge = label ? findTechBadge(label) : null;

        if (badge) {
          const offSrc = theme === 'dark' ? (badge.offDark ?? badge.off) : badge.off;

          return (
            <span key={key} className="inline-flex items-center">
              <img
                src={offSrc}
                alt={badge.label}
                className="h-[32px] w-auto select-none"
                draggable={false}
              />
            </span>
          );
        }

        if (s.icon) {
          return (
            <span key={key} className="inline-flex items-center">
              <span className="h-9 w-9">{s.icon}</span>
            </span>
          );
        }

        if (label) {
          return (
            <span
              key={key}
              className="Caption1 inline-flex items-center rounded-[20px] border border-[var(--ui-200)] bg-[var(--ui-100)] px-[10px] py-[6px] font-medium text-[var(--ui-800)]"
            >
              {label}
            </span>
          );
        }
        return null;
      })}

      {rest > 0 ? <span className="Label1 font-medium text-[var(--ui-400)]">+{rest}</span> : null}
    </div>
  );
}
