import BookmarkButton from '@components/common/BookmarkButton';
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
    <div className="relative flex items-start gap-6">
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
        iconClassName="h-[32px] w-[32px]"
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
    <span className="inline-flex items-center whitespace-nowrap rounded-xl bg-badge-bg-gray px-4 py-2 font-semibold text-[10px] text-badge-text-gray">
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
  if (!techStack?.length) return null;

  const shown = techStack.slice(0, max);
  const rest = Math.max(techStack.length - max, 0);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {shown.map((s, index) => {
        const anyS = s as any;

        const label =
          typeof anyS.name === 'string'
            ? anyS.name
            : typeof anyS.name?.name === 'string'
              ? anyS.name.name
              : '';

        if (!label) return null;

        const key = String(anyS.id ?? anyS.name?.techstackId ?? index);

        return (
          <div
            key={key}
            className="flex items-center gap-2 rounded-3xl border border-card-border bg-surface-tab px-4 py-1"
          >
            {anyS.icon}
            <span className="font-medium text-card-text text-lg">{label}</span>
          </div>
        );
      })}

      {rest > 0 && <span className="font-semibold text-card-muted text-lg">+{rest}</span>}
    </div>
  );
}
