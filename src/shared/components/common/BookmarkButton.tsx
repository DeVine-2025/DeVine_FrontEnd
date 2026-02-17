import BookmarkColorIcon from '@assets/icons/bookmark-color.svg?react';
import BookmarkFilledIcon from '@assets/icons/bookmark-filled.svg?react';

type BookmarkButtonProps = {
  bookmarked: boolean;
  onBookmarkChange?: (next: boolean) => void;
  stopPropagation?: boolean;
  className?: string;
  iconClassName?: string;
  colorIconClassName?: string;
  'aria-label'?: string;
};

export default function BookmarkButton({
  bookmarked,
  onBookmarkChange,
  className = '',
  iconClassName = 'h-[32px] w-[32px]',
  colorIconClassName,
  'aria-label': ariaLabel,
}: BookmarkButtonProps) {
  const colorClass = colorIconClassName ?? iconClassName;
  const containerClass = colorIconClassName ?? iconClassName; // 호버 시 시프트 방지

  return (
    <button
      type="button"
      aria-pressed={bookmarked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        onBookmarkChange?.(!bookmarked);
      }}
      className={`group/bookmark flex shrink-0 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ui-300)] focus-visible:outline-offset-2 ${className}`}
    >
      <span className={`relative inline-flex ${containerClass} items-center justify-center`}>
        <BookmarkFilledIcon
          aria-hidden
          className={`-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 ${iconClassName} text-[var(--ui-200)] transition-opacity duration-200 ease-out group-active/bookmark:scale-[0.98] ${bookmarked ? 'opacity-0' : 'opacity-100 group-hover/bookmark:opacity-0'}`}
        />
        <BookmarkColorIcon
          aria-hidden
          className={`-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 ${colorClass} transition-opacity duration-200 ease-out group-active/bookmark:scale-[0.98] ${bookmarked ? 'opacity-100' : 'opacity-0 group-hover/bookmark:opacity-100'}`}
        />
      </span>
    </button>
  );
}
