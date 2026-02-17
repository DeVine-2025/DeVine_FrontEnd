import PersonIcon from '@assets/icons/person.svg?react';
import DevineLogo from '@assets/images/Devine.svg';
import BookmarkButton from '@components/common/BookmarkButton';
import { badgeToneToClass } from '@t/badgeTone';
import type { ProjectCardBaseProps } from '@t/project/ui';
import type { KeyboardEvent } from 'react';

export default function ProjectBase(props: ProjectCardBaseProps) {
  const {
    categoryLabel,
    deadlineLabel,
    thumbnailUrl,
    thumbnailAlt,
    title,
    location,
    durationRangeName,
    mode,
    roles,
    dueLabel,
    bookmarked = false,
    onBookmarkChange,
    onClick,
    render,
  } = props;

  const Thumbnail = (
    <div className="shrink-0">
      <div className="flex h-[132px] w-[233px] overflow-hidden rounded-2xl bg-card-section-bg">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={thumbnailAlt ?? title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--ui-200)]">
            <img
              src={DevineLogo}
              alt="Devine logo"
              className="h-50 w-50 object-contain opacity-60"
            />
          </div>
        )}
      </div>
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
    <h3 className="line-clamp-2 pl-1 font-semibold text-[15px] text-card-title leading-snug">
      {title}
    </h3>
  );

  const metaText = [location, durationRangeName, mode].filter(Boolean).join(' | ');

  const Meta = metaText ? (
    <div className="truncate pl-1 text-badge-text-gray text-lg">{metaText}</div>
  ) : null;

  // 배지 / 인원 / 구분선 / 아이콘
  const RolesLg = roles?.length ? (
    <div className="flex flex-col gap-y-5">
      {roles.slice(0, 3).map((r, idx) => (
        <div
          key={`${r.key}-${idx}`}
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
      {roles.slice(0, 2).map((r, idx) => (
        <div key={`${r.key}-${idx}`} className="flex flex-col gap-3">
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

  const Due = dueLabel ? <p className="w-[65px] text-badge-text-gray text-lg">{dueLabel}</p> : null;

  const Bookmark = (
    <BookmarkButton
      bookmarked={bookmarked}
      onBookmarkChange={onBookmarkChange}
      stopPropagation
      className=""
      iconClassName="h-[28px] w-[28px]"
      colorIconClassName="h-[40px] w-[40px]"
    />
  );

  const CardActionProps = onClick
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick,
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
          }
        },
      }
    : {};

  return (
    <>
      {render({
        metaText,
        Thumbnail,
        HeaderBadges,
        Title,
        Meta,
        RolesLg,
        RolesMd,
        Due,
        Bookmark,
        CardActionProps,
      })}
    </>
  );
}
