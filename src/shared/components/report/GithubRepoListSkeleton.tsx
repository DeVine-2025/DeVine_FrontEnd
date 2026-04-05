import Skeleton from '@components/common/Skeleton';

type GithubRepoListSkeletonProps = {
  count?: number;
  /** 리포트 생성 페이지(CheckBox 레이아웃) / 온보딩 선택 UI */
  variant?: 'report-create' | 'signup';
};

export default function GithubRepoListSkeleton({
  count = 5,
  variant = 'report-create',
}: GithubRepoListSkeletonProps) {
  if (variant === 'signup') {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="mt-1 h-7 w-7 shrink-0 rounded-md" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Skeleton className="h-5 w-[min(55%,14rem)] rounded-md" />
              <Skeleton className="h-4 w-[min(92%,22rem)] rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[0.8rem]">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex gap-[1.6rem] p-[1.2rem]">
          <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-[0.4rem]">
            <Skeleton className="h-7 w-[min(60%,16rem)] rounded-md" />
            <Skeleton className="h-5 w-[min(95%,24rem)] rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
