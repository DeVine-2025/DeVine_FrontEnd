import { cn } from '@libs/cn';
import type { ReactNode } from 'react';
import BookmarkIcon from '@assets/icons/bookmark.svg?react';
import BookmarkFilled from '@assets/icons/bookmark-filled.svg?react';

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
      'max-w-[980px] w-full',
      'flex items-center',
      // border/bg 토큰 적용
      'min-h-[200px] gap-10 rounded-2xl border border-card-border bg-card-bg p-6',
      className,
    )}
  >
    {/* 썸네일 */}
    <div className="shrink-0">
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={thumbnailAlt ?? title}
          className="h-[140px] w-[140px] rounded-2xl object-cover bg-card-section-bg"
          loading="lazy"
        />
      ) : (
        <div className="h-[140px] w-[140px] rounded-2xl bg-card-section-bg" />
      )}
    </div>

    {/* 본문 */}
    <div className="min-w-0 flex flex-1 flex-col justify-center gap-4">
      {/* 상단: pill + 북마크 */}
      <div className="flex items-center">
        <div className="flex flex-wrap items-center gap-4">
          {categoryLabel && (
            <span className="inline-flex rounded-full bg-badge-bg-gray px-4 py-1 text-md font-medium text-badge-text-gray">
              {categoryLabel}
            </span>
          )}
          {deadlineLabel && (
            <span className="inline-flex rounded-full bg-badge-bg-gray px-4 py-1 text-md font-medium text-badge-text-gray">
              {deadlineLabel}
            </span>
          )}
        </div>

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
      </div>

      {/* 제목 */}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-2xl font-semibold leading-snug text-card-title pl-1">
          {title}
        </h3>
        {subtitle && (
          <h3 className="line-clamp-2 text-xl font-semibold leading-snug text-card-title pl-1">
            {subtitle}
          </h3>
        )}
        {meta && <div className="mt-2 truncate text-base text-card-muted pl-1">{meta}</div>}
      </div>

      {/* 하단: 포지션 */}
      {roles && roles.length > 0 && (
        <div className="mt-1 flex items-center gap-10">
          {roles.slice(0, 2).map((r) => (
            <div key={r.key} className="flex min-w-0 flex-1 items-center">
              <div className="min-w-0">
                <span
                  className={cn(
                    'inline-flex rounded-full px-4 py-2 text-base font-semibold',
                    badgeToneToClass[r.tone],
                  )}
                >
                  {r.label}
                </span>

                <div className="mt-2 ml-2 flex items-center gap-4 text-md text-card-muted">
                  <span className="inline-flex items-center gap-3">
                    <span aria-hidden="true">👤</span>
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
            </div>
          ))}
        </div>
      )}
    </div>
  </article>
);

}
