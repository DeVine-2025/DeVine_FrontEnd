import BookmarkButton from '@components/common/BookmarkButton';
import {
  BACKEND_DATABASE,
  BACKEND_FRAMEWORK,
  BACKEND_LANGUAGE,
  FRONTEND_LANGUAGE_FRAMEWORK,
  FRONTEND_MOBILE,
  INFRA_CLOUD,
  INFRA_CONTAINER,
  type TechStackChip,
} from '@constants/position-tech-stack';
import { cn } from '@libs/cn';
import { useThemeStore } from '@store/theme';
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
  const { theme } = useThemeStore();

  if (!techStack?.length) return null;

  const normalizeTechKey = (v: unknown): string => {
    const s = typeof v === 'string' ? v : v != null ? String(v) : '';
    return s
      .trim()
      .toLowerCase()
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(/-/g, '')
      .replace(/_/g, '');
  };

  const ALL_TECH_STACK_BADGES: Array<Extract<TechStackChip, { off: string; on: string }>> = [
    ...FRONTEND_LANGUAGE_FRAMEWORK,
    ...FRONTEND_MOBILE,
    ...BACKEND_LANGUAGE,
    ...BACKEND_FRAMEWORK,
    ...BACKEND_DATABASE,
    ...INFRA_CLOUD,
    ...INFRA_CONTAINER,
  ].filter(
    (b): b is Extract<TechStackChip, { off: string; on: string }> => 'off' in b && 'on' in b,
  );

  const TECH_BADGE_BY_NAME = new Map(
    ALL_TECH_STACK_BADGES.flatMap((b) => [
      [normalizeTechKey(b.key), b],
      [normalizeTechKey(b.label), b],
    ]),
  );

  const findBadge = (name: unknown) => {
    const normalized = normalizeTechKey(name);
    return TECH_BADGE_BY_NAME.get(normalized) ?? null;
  };

  const shown = techStack.slice(0, max);
  const rest = Math.max(techStack.length - max, 0);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {shown.map((s, index) => {
        const label = typeof s.name === 'string' ? s.name : '';
        const key = String(s.id ?? index);

        const badge = label ? findBadge(label) : null;

        if (badge) {
          const offSrc = theme === 'dark' ? (badge.offDark ?? badge.off) : badge.off;

          return (
            <span key={key} className="inline-flex items-center">
              <img
                src={offSrc}
                alt={badge.label}
                className="h-13 w-32 select-none"
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
        return null;
      })}

      {rest > 0 ? <span className="font-semibold text-card-muted text-lg">+{rest}</span> : null}
    </div>
  );
}
