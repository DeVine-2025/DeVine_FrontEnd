import Skeleton from '@ui/Skeleton';

const cardShellClass =
  'relative flex w-full max-w-[1180px] flex-col overflow-hidden rounded-2xl border border-[var(--ui-200)]/90 bg-[var(--ui-bg)] shadow-[0_1px_2px_rgba(0,0,0,0.06)]';

type ProjectCardSkeletonProps = {
  variant?: 'default' | 'compact';
};

export default function ProjectCardSkeleton({
  variant = 'default',
}: ProjectCardSkeletonProps) {
  if (variant === 'compact') {
    return (
      <div className={`${cardShellClass} min-h-[200px]`} aria-hidden>
        <div className="flex w-full flex-col items-center gap-4 px-4 py-5">
          <Skeleton className="h-[120px] w-[200px] max-w-full shrink-0 rounded-2xl" />
          <div className="flex w-full flex-col items-center gap-3">
            <div className="flex flex-wrap justify-center gap-2">
              <Skeleton className="h-6 w-[72px] rounded-lg" />
              <Skeleton className="h-6 w-[88px] rounded-lg" />
            </div>
            <Skeleton className="h-[14px] w-full max-w-[220px] rounded-md" />
            <Skeleton className="h-[12px] w-[min(180px,90%)] rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${cardShellClass} h-[180px]`} aria-hidden>
      <div className="flex h-full w-full items-center gap-10 overflow-hidden px-8 py-6">
        <Skeleton className="h-[132px] w-[233px] shrink-0 rounded-2xl" />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-4">
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-6 w-[72px] rounded-lg" />
            <Skeleton className="h-6 w-[88px] rounded-lg" />
          </div>
          <Skeleton className="h-[14px] w-full max-w-[420px] rounded-md" />
          <Skeleton className="h-[12px] w-[min(280px,50%)] rounded-md" />
        </div>
        <div className="mr-2 ml-auto hidden w-[200px] shrink-0 flex-col gap-3 min-[800px]:flex">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-[85%] rounded-md" />
        </div>
        <div
          className="pointer-events-none h-[52px] w-[52px] shrink-0"
          aria-hidden
        />
      </div>
    </div>
  );
}

type ListProps = {
  count?: number;
  className?: string;
};

export function ProjectCardSkeletonList({ count = 3, className }: ListProps) {
  return (
    <div className={className} aria-busy="true" aria-label="추천 프로젝트 로딩 중">
      <div className="flex flex-col gap-6">
        {Array.from({ length: count }, (_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
