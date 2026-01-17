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

export type ProjectCardProps = {
  id?: string;

  categoryLabel?: string;
  deadlineLabel?: string;

  thumbnailUrl?: string;
  thumbnailAlt?: string;

  title: string;
  subtitle?: string;
  location?: string;
  period?: string;
  mode?: string;
  size: string;

  roles?: Array<{
    key: string;
    label: string;
    tone: BadgeTone;
    current: number;
    total: number;
    techStack?: TechStackItem[];
  }>;

  bookmarked?: boolean;
  onBookmarkChange?: (next: boolean, id?: string) => void;

  className?: string;
};

const badgeToneToClass: Record<BadgeTone, string> = {
  blue: 'bg-badge-bg-blue text-badge-text-blue',
  green: 'bg-badge-bg-green text-badge-text-green',
  pink: 'bg-badge-bg-pink text-badge-text-pink',
  orange: 'bg-badge-bg-orange text-badge-text-orange',
};

export default function ProjectCard({
  id,
  categoryLabel,
  deadlineLabel,
  thumbnailUrl,
  thumbnailAlt,
  title,
  subtitle,
  location,
  period,
  mode,
  roles,
  bookmarked = false,
  onBookmarkChange,
  className,
}: ProjectCardProps) {
  const meta = [location, period, mode].filter(Boolean).join(' | ');

  return (
    <article
      className={cn(
        'w-full max-w-[980px]',
        'flex items-center',
        // border/bg 토큰 적용
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
            className="h-[120px] w-[120px] rounded-2xl bg-card-section-bg object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-[120px] w-[120px] rounded-2xl bg-card-section-bg" />
        )}
      </div>

      {/* 본문 */}
      <div className="flex flex-1 flex-col justify-center gap-5">
        {/* 모바일/앱 + 마감 */}
        <div className="flex flex-wrap items-center gap-4">
          {categoryLabel && (
            <span className="inline-flex rounded-lg bg-badge-bg-gray px-4 py-1 font-medium text-badge-text-gray text-md">
              {categoryLabel}
            </span>
          )}
          {deadlineLabel && (
            <span className="inline-flex rounded-lg bg-badge-bg-gray px-4 py-1 font-medium text-badge-text-gray text-md">
              {deadlineLabel}
            </span>
          )}
        </div>

        {/* 제목 */}
        <div>
          <h3 className="line-clamp-2 pl-1 font-semibold text-2xl text-card-title leading-snug">
            {title}
          </h3>
          {subtitle && (
            <h3 className="line-clamp-2 pl-1 font-semibold text-card-title text-xl leading-snug">
              {subtitle}
            </h3>
          )}
        </div>
        {meta && <div className="truncate pl-1 text-badge-text-gray text-lg">{meta}</div>}
      </div>

      {/* 포지션 */}
      {roles && roles.length > 0 && (
        <div className="flex flex-col items-center gap-8">
          {roles.slice(0, 2).map((r) => (
            <div key={r.key} className="flex min-w-0 items-center gap-5">
              <span
                className={cn(
                  'inline-flex rounded-full px-4 py-2 font-semibold text-base',
                  badgeToneToClass[r.tone],
                )}
              >
                {r.label}
              </span>

              <div className="flex items-center gap-4 text-card-muted text-md">
                <span className="inline-flex items-center gap-3">
                  <span className="font-medium">
                    {r.current}/{r.total}
                  </span>
                </span>

                {/* 세로 구분선: divider 토큰 */}
                <span className="h-4 w-px bg-card-divider" aria-hidden="true" />

                {r.techStack && r.techStack.length > 0 && (
                  <div className="flex items-center gap-2">
                    {r.techStack.map((t) => (
                      <span key={t.id} className="inline-flex items-center">
                        {t.icon}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        aria-pressed={bookmarked}
        onClick={() => onBookmarkChange?.(!bookmarked, id)}
        className="ml-auto rounded-lg p-2 text-card-muted hover:opacity-80"
      >
        {bookmarked ? (
          <BookmarkFilled aria-hidden="true" className="h-8 w-8 text-card-title" />
        ) : (
          <BookmarkIcon aria-hidden="true" className="h-8 w-8 text-card-muted" />
        )}
      </button>
    </article>
  );
}
