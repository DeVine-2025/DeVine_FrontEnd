import BookmarkFilledIcon from '@assets/icons/bookmark-filled.svg?react';
import PersonIcon from '@assets/icons/person.svg?react';
import { badgeToneToClass } from 'src/shared/types/badgeTone';
import type { RecommendProjectCardProps } from 'src/shared/types/recommendProjectCard.types';

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

  // Recommend 전용 타입과 공용 배지 톤 매핑을 느슨하게 연결
  const toneToClass = badgeToneToClass as unknown as Record<string, string>;

  return (
    <article
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
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
      className={`relative h-[238px] w-full max-w-[1280px] overflow-hidden rounded-[24px] bg-[var(--ui-bg)] ${
        onClick ? 'cursor-pointer' : ''
      }`}
      style={{
        border: '1px solid transparent',
        background:
          'linear-gradient(var(--ui-bg), var(--ui-bg)) padding-box, linear-gradient(90deg, rgba(114, 110, 255, 0.4) 0%, rgba(219, 80, 179, 0.4) 100%) border-box',
      }}
    >
      <div className="flex h-[132px] items-center gap-[32px] px-[24px] pt-[24px]">
        <div className="h-[132px] w-[233px] shrink-0 translate-y-[8px] overflow-hidden rounded-[12px] bg-[var(--ui-100)]">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={thumbnailAlt ?? title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : null}
        </div>

        <div className="flex w-[372px] shrink-0 self-start -translate-y-[3px] flex-col gap-[16px]">
          <div className="flex flex-col gap-[12px]">
            <div className="flex items-center gap-[4px]">
              {categoryLabel ? (
                <span className="Caption1 flex h-[28px] items-center justify-center rounded-[8px] bg-[var(--ui-100)] px-[8px] py-[4px] font-semibold text-[var(--ui-600)]">
                  {categoryLabel}
                </span>
              ) : null}
              {deadlineLabel ? (
                <span className="Caption1 flex h-[28px] items-center justify-center rounded-[8px] bg-[var(--ui-100)] px-[8px] py-[4px] font-semibold text-[var(--ui-600)]">
                  {deadlineLabel}
                </span>
              ) : null}
            </div>

            <p className="Headline1 w-[372px] whitespace-pre-wrap font-semibold text-[var(--ui-1000)]">
              {title}
            </p>
          </div>

          <p className="Caption1 mt-[32px] font-semibold text-[var(--ui-600)]">
            {[location, period, mode].filter(Boolean).join(' · ')}
          </p>
        </div>

        <div className="flex h-[132px] w-[202px] shrink-0 translate-y-[16px] flex-col items-center justify-center gap-[12px]">
          {roles?.slice(0, 3).map((r) => (
            <div key={r.key} className="grid w-full grid-cols-[96px_56px_1px_1fr] items-center gap-x-[12px]">
              <span
                className={`Label1 inline-flex w-fit max-w-[96px] justify-self-center items-center justify-center truncate rounded-[8px] px-[12px] py-[6px] font-semibold ${
                  toneToClass[r.tone] ?? ''
                }`}
              >
                {r.label}
              </span>

              <div className="flex w-[56px] items-center gap-[4px] text-[var(--ui-400)]">
                <PersonIcon aria-hidden className="h-[16px] w-[16px]" />
                <span className="Caption1 font-semibold text-[var(--ui-1000)]">{r.current}</span>
                <span className="Caption1 font-semibold text-[var(--ui-500)]">/</span>
                <span className="Caption1 font-semibold text-[var(--ui-400)]">{r.total}</span>
              </div>

              <span className="h-[10px] w-px bg-[var(--ui-300)]" />

              <div className="flex items-center gap-[4px] overflow-hidden">
                {r.techStack?.slice(0, 5).map((t) => (
                  <span key={t.id} className="inline-flex h-[20px] w-[20px] items-center justify-center">
                    {t.icon}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="Body1 absolute right-[140px] top-1/2 flex w-[100px] -translate-y-1/2 items-center justify-center text-center font-semibold text-[var(--ui-500)]">
        {dueLabel}
      </div>

      <button
        type="button"
        aria-pressed={bookmarked}
        onClick={(e) => {
          e.stopPropagation();
          onBookmarkChange?.(!bookmarked);
        }}
        className="group absolute right-[24px] top-1/2 flex h-[52px] w-[52px] -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ui-300)]"
      >
        <BookmarkFilledIcon
          aria-hidden
          className="h-[32px] w-[32px] text-[var(--ui-200)] transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-[0.98] group-hover:text-[var(--ui-300)]"
        />
      </button>

      {hasSuitability && suitabilityText ? (
        <div className="absolute bottom-[24px] left-[24px] w-[908px] rounded-[12px] bg-[var(--ui-100)] px-[12px] py-[8px]">
          <p className="Body1 font-medium text-[var(--ui-1000)]">{suitabilityText}</p>
        </div>
      ) : null}
    </article>
  );
}
