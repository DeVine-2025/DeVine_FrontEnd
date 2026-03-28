import Skeleton from '@components/common/Skeleton';

export default function RecommendProjectCardSkeleton() {
  return (
    <div
      className="relative flex h-[180px] w-full max-w-[1180px] flex-col overflow-hidden rounded-2xl border border-[var(--ui-200)]/90 bg-[var(--ui-bg)] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
      aria-hidden
    >
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

export function RecommendProjectCardSkeletonList({ count = 3, className }: ListProps) {
  return (
    <div className={className} aria-busy="true" aria-label="추천 프로젝트 로딩 중">
      <div className="flex flex-col gap-6">
        {Array.from({ length: count }, (_, i) => (
          <RecommendProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
