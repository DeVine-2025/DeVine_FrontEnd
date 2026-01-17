import BookmarkIcon from '@assets/icons/bookmark.svg?react';
import BookmarkFilled from '@assets/icons/bookmark-filled.svg?react';
import { cn } from '@libs/cn';
import type { ReactNode } from 'react';

export type BadgeTone = 'blue' | 'green' | 'pink' | 'orange';

export type TechStackItem = {
  id: string;
  icon?: ReactNode;
};

export type ProjectCardProps = {
  categoryLabel?: string;
  deadlineLabel?: string;

  thumbnailUrl?: string;
  thumbnailAlt?: string;

  title: string;
  location?: string;
  period?: string;
  mode?: string;

  roles?: Array<{
    key: string;
    label: string;
    tone: BadgeTone;
    current: number;
    total: number;
    techStack?: TechStackItem[];
  }>;

  dueLabel?: string;
  bookmarked?: boolean;
  onBookmarkChange?: (next: boolean) => void;

  className?: string;
};

const badgeToneToClass: Record<BadgeTone, string> = {
  blue: 'bg-badge-bg-blue text-badge-text-blue',
  green: 'bg-badge-bg-green text-badge-text-green',
  pink: 'bg-badge-bg-pink text-badge-text-pink',
  orange: 'bg-badge-bg-orange text-badge-text-orange',
};

export default function ProjectCard({
  categoryLabel,
  deadlineLabel,
  thumbnailUrl,
  thumbnailAlt,
  title,
  location,
  period,
  mode,
  roles,
  dueLabel,
  bookmarked = false,
  onBookmarkChange,
  className,
}: ProjectCardProps) {
  const meta = [location, period, mode].filter(Boolean).join(' | ');

  return (
    <article
      className={cn(
        'w-full max-w-[1180px]',
        'flex items-center',
        'min-h-[180px] gap-10 rounded-2xl border border-card-border bg-card-bg p-8',
        className,
      )}
    >
      {/* 썸네일 */}
      <div className="shrink-0">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={thumbnailAlt ?? title}
            className="h-[132px] w-[233px] rounded-2xl bg-card-section-bg object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-[132px] w-[233px] rounded-2xl bg-card-profile-reason-bg" />
        )}
      </div>

      {/* 본문 */}
      <div className="flex flex-1 flex-col justify-center gap-5">
        <div className="flex flex-wrap items-center gap-4">
          {categoryLabel && (
            <span className="inline-flex rounded-lg bg-badge-bg-gray px-3 py-1 font-medium text-badge-text-gray text-md">
              {categoryLabel}
            </span>
          )}
          {deadlineLabel && (
            <span className="inline-flex rounded-lg bg-badge-bg-gray px-3 py-1 font-medium text-badge-text-gray text-md">
              {deadlineLabel}
            </span>
          )}
        </div>

        <div>
          <h3 className="line-clamp-2 pl-1 font-semibold text-2xl text-card-title leading-snug">
            {title}
          </h3>
        </div>

        {meta && <div className="truncate pl-1 text-badge-text-gray text-lg">{meta}</div>}
      </div>

      {/* 포지션 */}
      {roles?.length ? (
        <div className="flex flex-col gap-y-6">
          {roles.slice(0, 3).map((r) => (
            <div key={r.key} className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
              <div />

              <span
                className={cn(
                  'inline-flex items-center whitespace-nowrap rounded-lg px-3 py-2 font-semibold text-base',
                  badgeToneToClass[r.tone],
                )}
              >
                {r.label}
              </span>

              <span className="justify-self-end whitespace-nowrap font-medium text-card-muted text-lg">
                {r.current}/{r.total}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {/* 마감 기한 */}
      {dueLabel && (
        <div className="ml-auto flex items-center px-5">
          <p className="text-badge-text-gray text-xl">{dueLabel}</p>
        </div>
      )}

      {/* 북마크 */}
      <button
        type="button"
        aria-pressed={bookmarked}
        onClick={() => onBookmarkChange?.(!bookmarked)}
        className="ml-auto w-[40px] text-card-muted hover:opacity-80"
      >
        {bookmarked ? (
          <BookmarkFilled aria-hidden="true" className="h-10 w-10 text-card-title" />
        ) : (
          <BookmarkIcon aria-hidden="true" className="h-10 w-10 text-card-muted" />
        )}
      </button>
    </article>
  );
}
