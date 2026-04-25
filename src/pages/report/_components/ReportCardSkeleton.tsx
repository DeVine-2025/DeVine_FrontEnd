import Skeleton from '@ui/Skeleton';
import { cn } from '@libs/cn';
import { useThemeStore } from '@store/theme.store';

export default function ReportCardSkeleton() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  return (
    <div
      className={cn(
        'flex min-h-[14rem] flex-col overflow-hidden rounded-[16px] border',
        isLight
          ? 'border-[var(--ui-200)] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
          : 'border-white/[0.07] bg-white/[0.03]',
      )}
    >
      <Skeleton className="h-[3px] w-full shrink-0 rounded-none rounded-t-[15px]" />
      <div className="flex flex-1 flex-col gap-[1.4rem] p-[2rem]">
        <div className="flex items-center justify-between">
          <Skeleton className="h-[2rem] w-[4.8rem] rounded-full" />
          <Skeleton className="h-[2.4rem] w-[4.8rem] rounded-full" />
        </div>
        <div className="flex flex-1 flex-col gap-[0.6rem]">
          <Skeleton className="h-[15px] w-[70%] rounded-md" />
          <Skeleton className="h-[12px] w-full rounded-md" />
          <Skeleton className="h-[12px] w-[88%] rounded-md" />
        </div>
      </div>
    </div>
  );
}

type ListProps = {
  count?: number;
  className?: string;
};

export function ReportCardSkeletonList({ count = 3, className }: ListProps) {
  return (
    <div className={cn('contents', className)}>
      {Array.from({ length: count }, (_, i) => (
        <ReportCardSkeleton key={i} />
      ))}
    </div>
  );
}
