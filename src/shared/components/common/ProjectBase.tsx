import BookmarkIcon from '@assets/icons/bookmark.svg?react';
import PersonIcon from '@assets/icons/person.svg?react';
import type { ProjectCardBaseProps } from 'src/shared/types/projectCard.types.ts';
import { badgeToneToClass } from '../../types/badgeTone';

export default function ProjectBase(props: ProjectCardBaseProps) {
  const {
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
    render,
  } = props;

  const metaText = [location, period, mode].filter(Boolean).join(' | ');

  const Thumbnail = (
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
  );

  const HeaderBadges =
    categoryLabel || deadlineLabel ? (
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
    ) : null;

  const Title = (
    <h3 className="line-clamp-2 pl-1 font-semibold text-[16px] text-card-title leading-snug">
      {title}
    </h3>
  );

  const Meta = metaText ? (
    <div className="truncate pl-1 text-badge-text-gray text-lg">{metaText}</div>
  ) : null;

  // 배지 / 인원 / 구분선 / 아이콘
  const RolesLg = roles?.length ? (
    <div className="flex flex-col gap-y-5">
      {roles.slice(0, 3).map((r) => (
        <div
          key={r.key}
          className="grid grid-cols-[60px_auto_8px_1fr] items-center gap-x-4 text-card-muted"
        >
          <span
            className={`inline-flex w-fit items-center whitespace-nowrap rounded-lg px-3 py-1 font-semibold text-base ${badgeToneToClass[r.tone]}`}
          >
            {r.label}
          </span>

          <div className="flex items-center gap-2">
            <PersonIcon className="h-5 w-5 text-card-muted" />
            <span className="whitespace-nowrap font-bold text-lg">
              {r.current}/{r.total}
            </span>
          </div>

          <span className="justify-self-center text-card-muted/50">
            {r.techStack?.length ? '|' : ''}
          </span>

          <div className="flex items-center gap-2">
            {r.techStack?.slice(0, 5).map((t) => (
              <span key={t.id} className="inline-flex h-6 w-6 items-center justify-center">
                {t.icon}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  ) : null;

  const RolesMd = roles?.length ? (
    <div className="grid grid-cols-2 gap-x-10 gap-y-7">
      {roles.slice(0, 2).map((r) => (
        <div key={r.key} className="flex flex-col gap-3">
          <span
            className={`inline-flex w-fit items-center whitespace-nowrap rounded-lg px-3 py-1 font-semibold text-base ${badgeToneToClass[r.tone]}`}
          >
            {r.label}
          </span>

          <div className="flex items-center gap-4 text-card-muted">
            <div className="flex items-center gap-2">
              <PersonIcon className="h-5 w-5 text-card-muted" />
              <span className="font-bold text-lg">
                {r.current}/{r.total}
              </span>
            </div>

            {r.techStack?.length ? (
              <div className="flex items-center gap-2">
                {r.techStack.slice(0, 5).map((t) => (
                  <span key={t.id} className="inline-flex h-6 w-6 items-center justify-center">
                    {t.icon}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  ) : null;

  const Due = dueLabel ? <p className="w-[65px] text-badge-text-gray text-xl">{dueLabel}</p> : null;

  const Bookmark = (
    <button
      type="button"
      aria-pressed={bookmarked}
      onClick={() => onBookmarkChange?.(!bookmarked)}
      className="cursor-pointer hover:opacity-80"
    >
      {bookmarked ? (
        <BookmarkIcon aria-hidden="true" className="h-9 w-9 text-card-muted" />
      ) : (
        <BookmarkIcon aria-hidden="true" className="h-9 w-9 text-card-muted" />
      )}
    </button>
  );

  return (
    <>
      {render({ metaText, Thumbnail, HeaderBadges, Title, Meta, RolesLg, RolesMd, Due, Bookmark })}
    </>
  );
}
