import type { ProjectCardProps, ProjectRole } from 'src/shared/types/projectCard.types.ts';
import { badgeToneToClass } from 'src/shared/types/badgeTone';
import BookmarkIcon from '@assets/icons/bookmark.svg?react';
import BookmarkFilled from '@assets/icons/bookmark-filled.svg?react';
import PersonIcon from '@assets/icons/person.svg?react';

export type RecommendProjectCardProps = ProjectCardProps & {
  techSuitability?: number;
  domainSuitability?: number;
  growthPotential?: number;
  overallScore?: number;
};

export default function RecommendProjectCard({
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
  onClick,
  techSuitability,
  domainSuitability,
  growthPotential,
  overallScore,
}: RecommendProjectCardProps) {
  const metaText = [location, period, mode].filter(Boolean).join(' · ');
  const hasSuitability =
    techSuitability != null ||
    domainSuitability != null ||
    growthPotential != null ||
    overallScore != null;

  const suitabilityParts: string[] = [];
  if (techSuitability != null) suitabilityParts.push(`기술 적합도 : ${techSuitability}/5`);
  if (domainSuitability != null) suitabilityParts.push(`도메인 적합도 : ${domainSuitability}/5`);
  if (growthPotential != null) suitabilityParts.push(`성장 가능성 : ${growthPotential}/5`);
  if (overallScore != null) suitabilityParts.push(`종합 점수: ${overallScore}`);
  const suitabilityText = suitabilityParts.join(', ');

  return (
    <article
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      className={`flex w-full max-w-[1180px] flex-col overflow-hidden rounded-2xl border border-card-border bg-card-bg ${onClick ? 'cursor-pointer' : ''}`}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {/* 상단: 썸네일 | 뱃지/타이틀/메타 | 역할/마감/북마크 */}
      <div className="flex min-h-[180px] items-center gap-8 p-8">
        {/* 썸네일 124x124 */}
        <div className="shrink-0">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={thumbnailAlt ?? title}
              className="size-[124px] rounded-xl bg-card-section-bg object-cover"
              loading="lazy"
            />
          ) : (
            <div className="size-[124px] rounded-xl bg-card-profile-reason-bg" />
          )}
        </div>

        {/* 뱃지 · 타이틀 · 메타 */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {categoryLabel && (
              <span className="inline-flex rounded-lg bg-badge-bg-gray px-3 py-1 font-medium text-badge-text-gray text-lg">
                {categoryLabel}
              </span>
            )}
            {deadlineLabel && (
              <span className="inline-flex rounded-lg bg-badge-bg-gray px-3 py-1 font-medium text-badge-text-gray text-lg">
                {deadlineLabel}
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 pl-1 font-semibold text-2xl text-card-title leading-snug">
            {title}
          </h3>
          {metaText && (
            <div className="truncate pl-1 text-lg text-badge-text-gray">{metaText}</div>
          )}
        </div>

        {/* 역할 · 마감 · 북마크 */}
        <div className="ml-auto flex w-[300px] shrink-0 items-center justify-end gap-6">
          {roles?.length ? (
            <div className="flex flex-col gap-y-5">
              {roles.slice(0, 3).map((r: ProjectRole) => (
                <div
                  key={r.key}
                  className="grid grid-cols-[60px_auto_8px_1fr] items-center gap-x-4 text-card-muted"
                >
                  <span
                    className={`inline-flex w-fit whitespace-nowrap rounded-lg px-3 py-1 font-semibold text-base ${badgeToneToClass[r.tone]}`}
                  >
                    {r.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <PersonIcon className="h-5 w-5 text-card-muted" aria-hidden />
                    <span className="whitespace-nowrap font-bold text-lg">
                      {r.current}/{r.total}
                    </span>
                  </div>
                  <span className="justify-self-center text-card-muted/50">
                    {r.techStack?.length ? '|' : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    {r.techStack?.slice(0, 5).map((t) => (
                      <span
                        key={t.id}
                        className="inline-flex h-6 w-6 items-center justify-center"
                      >
                        {t.icon}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {dueLabel && (
            <p className="w-[65px] shrink-0 text-xl text-badge-text-gray">{dueLabel}</p>
          )}
          <button
            type="button"
            aria-pressed={bookmarked}
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkChange?.(!bookmarked);
            }}
            className="shrink-0 cursor-pointer hover:opacity-80"
          >
            {bookmarked ? (
              <BookmarkFilled aria-hidden className="h-10 w-10 text-card-muted" />
            ) : (
              <BookmarkIcon aria-hidden className="h-10 w-10 text-card-muted" />
            )}
          </button>
        </div>
      </div>

      {/* 하단 적합도 strip (Figma: 연한 보라/파랑 배경) */}
      {hasSuitability && suitabilityText && (
        <div className="bg-[#E8ECF7] px-8 py-4 text-center text-base text-card-title dark:bg-[#252830]">
          {suitabilityText}
        </div>
      )}
    </article>
  );
}
