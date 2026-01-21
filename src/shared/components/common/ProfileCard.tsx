import BookmarkIcon from '@assets/icons/bookmark.svg?react';
import BookmarkFilled from '@assets/icons/bookmark-filled.svg?react';
import { cn } from '@libs/cn';
import type { ReactNode } from 'react';

export type BadgeTone = 'blue' | 'green' | 'pink' | 'orange';

export type TechStackItem = {
  id: string;
  name: string;
  icon?: ReactNode;
};

export type ProfileCardProps = {
  role: string;
  roleTone?: BadgeTone;
  nickname: string;
  profileImageUrl: string;
  profileImageAlt?: string;
  id?: string;

  introduction?: string;

  badges?: Array<{ label: string; tone: BadgeTone }>;
  techStack?: TechStackItem[];

  bookmarked?: boolean;
  onBookmarkChange?: (next: boolean, id?: string) => void;

  size?: 'sm' | 'md';
  className?: string;
};

const badgeToneToClass: Record<BadgeTone, string> = {
  blue: 'bg-badge-bg-blue text-badge-text-blue',
  green: 'bg-badge-bg-green text-badge-text-green',
  pink: 'bg-badge-bg-pink text-badge-text-pink',
  orange: 'bg-badge-bg-orange text-badge-text-orange',
};

export default function ProfileCard({
  role,
  roleTone,
  nickname,
  profileImageUrl,
  profileImageAlt,
  id,
  introduction,
  badges,
  techStack,
  bookmarked = false,
  onBookmarkChange,
  size = 'sm',
  className,
}: ProfileCardProps) {
  const rootSizeClass = size === 'sm' ? 'card-size-sm' : 'card-size-md';
  const avatarClass = size === 'sm' ? 'card-avatar-sm' : 'card-avatar-md';

  const maxTech = 4;
  const shownTech = (techStack ?? []).slice(0, maxTech);
  const restCount = Math.max((techStack?.length ?? 0) - maxTech, 0);

  return (
    <article
      className={cn(
        'flex flex-col rounded-2xl border border-transparent bg-filter-bg',
        rootSizeClass,
        className,
      )}
    >
      {/* 상단 영역 */}
      <div className="flex items-center gap-4">
        {/* 프로필 이미지 */}
        <img
          src={profileImageUrl}
          alt={profileImageAlt ?? nickname}
          className={cn(avatarClass, 'shrink-0 rounded-full object-cover', 'ring-2 ring-white/40')}
          loading="lazy"
        />

        {/* 역할 + 닉네임 */}
        <div className="flex min-w-0 flex-col gap-4 pl-2">
          {/* 역할 배지 */}
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

          {/* 닉네임 */}
          <div className="truncate font-medium text-[16px] text-card-title">{nickname}</div>
        </div>

        {/* 북마크 버튼 */}
        <button
          type="button"
          aria-pressed={bookmarked}
          onClick={() => onBookmarkChange?.(!bookmarked, id)}
          className="ml-auto cursor-pointer self-start hover:opacity-80"
        >
          {bookmarked ? (
            <BookmarkFilled aria-hidden="true" className="h-10 w-10 text-card-muted" />
          ) : (
            <BookmarkIcon aria-hidden="true" className="h-10 w-10 text-card-muted" />
          )}
        </button>
      </div>

      {/* 배지 */}
      {badges && badges.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {badges.map(({ label, tone }, idx) => (
            <span
              key={`${label}-${idx}`}
              className={cn(
                'inline-flex items-center rounded-xl px-4 py-2',
                'font-semibold text-[10px] text-badge-text-gray',
                'bg-badge-bg-gray',
              )}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* 소개 */}
      {introduction && <p className="line-clamp-2 pl-2 text-card-text text-lg">{introduction}</p>}

      {/* 스킬 */}
      {techStack && techStack.length > 0 && (
        <div className="flex flex-wrap items-center gap-4">
          {techStack.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-1 rounded-3xl border border-card-border bg-surface-tab px-4 py-1"
            >
              {s.icon}
              <span className="text-card-text text-lg">{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
