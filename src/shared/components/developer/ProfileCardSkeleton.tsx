import Skeleton from '@ui/Skeleton';
import { cn } from '@libs/cn';

type Props = {
  size?: 'lg' | 'sm';
  className?: string;
};

export default function ProfileCardSkeleton({ size = 'lg', className }: Props) {
  if (size === 'sm') {
    return (
      <div
        className={cn(
          'card-size-sm shrink-0 rounded-2xl border border-card-border bg-card-bg',
          className,
        )}
        aria-hidden
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Skeleton className="card-avatar-sm shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-[120px]" />
              <Skeleton className="h-4 w-[90px]" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Skeleton className="h-6 w-16 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-lg" />
          </div>
          <div className="mt-2 ml-2 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[85%]" />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Skeleton className="h-7 w-14 rounded-[20px]" />
            <Skeleton className="h-7 w-16 rounded-[20px]" />
            <Skeleton className="h-7 w-12 rounded-[20px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'card-size-lg flex flex-col rounded-2xl border border-card-border bg-card-bg',
        className,
      )}
      aria-hidden
    >
      <div className="flex min-h-0 flex-1 items-center gap-9">
        <Skeleton className="card-avatar-sm shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-4">
          <Skeleton className="ml-1 h-8 w-[min(200px,40%)]" />
          <div className="flex flex-wrap gap-4 pl-1">
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-24 rounded-lg" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
          <div className="flex flex-col gap-2 pl-1">
            <Skeleton className="h-5 w-full max-w-[480px]" />
            <Skeleton className="h-5 w-full max-w-[360px]" />
          </div>
        </div>
        <div className="hidden w-[330px] shrink-0 flex-wrap items-center gap-2 min-[900px]:flex">
          <Skeleton className="h-8 w-14 rounded-[20px]" />
          <Skeleton className="h-8 w-16 rounded-[20px]" />
          <Skeleton className="h-8 w-20 rounded-[20px]" />
          <Skeleton className="h-8 w-12 rounded-[20px]" />
        </div>
        <Skeleton className="ml-auto mr-5 h-10 w-10 shrink-0 rounded-full" />
      </div>
    </div>
  );
}

type ListProps = {
  count?: number;
  size?: 'lg' | 'sm';
  className?: string;
};

export function ProfileCardSkeletonList({ count = 4, size = 'lg', className }: ListProps) {
  return (
    <div
      className={className}
      aria-busy="true"
      aria-label="개발자 목록 로딩 중"
    >
      {size === 'sm' ? (
        <div className="scrollbar-hide flex justify-start gap-6 overflow-x-auto">
          {Array.from({ length: count }, (_, i) => (
            <ProfileCardSkeleton key={i} size="sm" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Array.from({ length: count }, (_, i) => (
            <ProfileCardSkeleton key={i} size="lg" />
          ))}
        </div>
      )}
    </div>
  );
}
