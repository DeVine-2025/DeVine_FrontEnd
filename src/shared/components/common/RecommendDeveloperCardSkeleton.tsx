import Skeleton from '@components/common/Skeleton';

export default function RecommendDeveloperCardSkeleton() {
  return (
    <div
      className="relative h-[196px] w-full max-w-[1280px] overflow-hidden rounded-[24px] border border-[var(--ui-200)]/90 bg-[var(--ui-bg)] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
      aria-hidden
    >
      <div className="absolute top-[calc(50%-30px)] left-[24px] flex -translate-y-1/2 items-center gap-[12px]">
        <div className="box-border h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full border border-[var(--ui-200)]/80 bg-[var(--ui-50)]/30">
          <Skeleton className="size-full rounded-full" />
        </div>
        <div className="flex w-[394px] max-w-[45vw] flex-col gap-[8px]">
          <Skeleton className="h-[18px] w-[148px] rounded-lg" />
          <div className="flex gap-[6px]">
            <Skeleton className="h-[15px] w-[52px] rounded-full" />
            <Skeleton className="h-[15px] w-[60px] rounded-full" />
            <Skeleton className="h-[15px] w-[48px] rounded-full" />
          </div>
          <Skeleton className="h-[11px] w-full max-w-[320px] rounded-md" />
          <Skeleton className="h-[11px] w-full max-w-[252px] rounded-md" />
        </div>
      </div>

      <div className="absolute top-1/2 left-[780px] hidden w-[300px] -translate-y-1/2 flex-wrap gap-[6px] min-[900px]:flex">
        <Skeleton className="h-[24px] w-[70px] rounded-full" />
        <Skeleton className="h-[24px] w-[78px] rounded-full" />
        <Skeleton className="h-[24px] w-[62px] rounded-full" />
        <Skeleton className="h-[24px] w-[86px] rounded-full" />
      </div>

      <div
        className="pointer-events-none absolute top-1/2 right-[24px] h-[52px] w-[52px] -translate-y-1/2"
        aria-hidden
      />

      <div className="absolute bottom-[28px] left-[24px] rounded-full bg-[var(--ui-50)]/50 px-[14px] py-[7px]">
        <Skeleton className="h-[11px] w-[min(400px,68vw)] max-w-full rounded-full" />
      </div>
    </div>
  );
}

type ListProps = {
  count?: number;
  className?: string;
};

export function RecommendDeveloperCardSkeletonList({ count = 3, className }: ListProps) {
  return (
    <div
      className={className}
      aria-busy="true"
      aria-label="추천 개발자 목록 로딩 중"
    >
      <div className="flex flex-col gap-6">
        {Array.from({ length: count }, (_, i) => (
          <RecommendDeveloperCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
