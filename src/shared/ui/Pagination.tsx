import { cn } from '@libs/cn';

type Props = {
  page: number;
  totalPages: number;
  onChange: (nextPage: number) => void;
  maxButtons?: number;
  className?: string;
  prevLabel?: string;
  nextLabel?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getPageRange(page: number, totalPages: number, maxButtons: number) {
  if (totalPages <= 0) return [];

  const half = Math.floor(maxButtons / 2);
  let start = page - half;
  let end = start + maxButtons - 1;

  if (start < 1) {
    start = 1;
    end = Math.min(totalPages, start + maxButtons - 1);
  }
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxButtons + 1);
  }

  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
}

export default function Pagination({
  page,
  totalPages,
  onChange,
  maxButtons = 10,
  className,
  prevLabel = '<',
  nextLabel = '>',
}: Props) {
  if (totalPages <= 1) return null;

  const safePage = clamp(page, 1, totalPages);
  const pages = getPageRange(safePage, totalPages, maxButtons);

  const go = (next: number) => {
    const nextPage = clamp(next, 1, totalPages);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    onChange(nextPage);
  };
  return (
    <nav
      className={cn('flex items-center justify-center gap-2', className)}
      aria-label="pagination"
    >
      <button
        type="button"
        disabled={safePage <= 1}
        onClick={() => go(safePage - 1)}
        className="rounded-lg border border-card-border px-3 py-2 text-card-title text-sm disabled:opacity-40"
      >
        {prevLabel}
      </button>

      {pages[0] > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(1)}
            className="h-9 w-9 rounded-lg border border-card-border text-card-title text-sm"
          >
            1
          </button>
          {pages[0] > 2 && <span className="px-1 text-card-title text-sm">…</span>}
        </>
      )}

      {pages.map((p) => {
        const isActive = p === safePage;
        return (
          <button
            key={p}
            type="button"
            onClick={() => go(p)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'h-9 w-9 rounded-lg border text-sm',
              isActive
                ? 'border-[#4E49FF] bg-[#4E49FF] text-white'
                : 'border-card-border bg-transparent text-card-title',
            )}
          >
            {p}
          </button>
        );
      })}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="px-1 text-card-title text-sm">…</span>
          )}
          <button
            type="button"
            onClick={() => go(totalPages)}
            className="h-9 w-9 rounded-lg border border-card-border text-sm"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        disabled={safePage >= totalPages}
        onClick={() => go(safePage + 1)}
        className="rounded-lg border border-card-border px-3 py-2 text-card-title text-sm disabled:opacity-40"
      >
        {nextLabel}
      </button>
    </nav>
  );
}
