import { cn } from '@libs/cn';

type AdminStatusBadgeTone = 'positive' | 'negative' | 'neutral';

type AdminStatusBadgeProps = {
  status: string;
  tone?: AdminStatusBadgeTone;
  className?: string;
};

const TONE_CLASS: Record<AdminStatusBadgeTone, string> = {
  positive: 'bg-[var(--positive-bg)] text-[var(--positive-text)]',
  negative: 'bg-[var(--negative-bg)] text-[var(--negative-text)]',
  neutral: 'bg-[var(--ui-50)] text-[var(--ui-400)]',
};

/** Figma 목록 테이블에서 공통으로 사용하는 상태 배지입니다. */
export function AdminStatusBadge({ status, tone = 'neutral', className }: AdminStatusBadgeProps) {
  return (
    <span
      className={cn(
        'Body1 inline-flex items-center justify-center rounded-[8px] px-[10px] py-[6px] font-semibold',
        TONE_CLASS[tone],
        className,
      )}
    >
      {status}
    </span>
  );
}
