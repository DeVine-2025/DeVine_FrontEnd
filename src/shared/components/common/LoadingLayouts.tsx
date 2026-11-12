import Skeleton from './Skeleton';

export function CardLoading({ kind, view = 'list', count = 3 }: { kind: 'developer' | 'project'; view?: 'list' | 'grid'; count?: number }) {
  return <div role="status" aria-label={`${kind === 'developer' ? '개발자' : '프로젝트'} 목록을 불러오는 중`} className={view === 'grid' ? 'grid grid-cols-1 gap-[12px] sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-[12px]'}>
    {Array.from({ length: count }, (_, index) => <div key={index} className={`overflow-hidden rounded-xl border border-white/[0.08] bg-[var(--surface-filter)] ${view === 'list' ? 'flex min-h-[128px]' : ''}`}>
      <Skeleton className={view === 'grid' ? 'h-[150px] w-full rounded-none lg:max-2xl:h-[clamp(124px,14vw,188px)] lg:max-2xl:p-[12px]' : 'hidden w-[22%] min-w-[100px] rounded-none sm:block lg:max-2xl:p-[12px]'} />
      <div className="flex min-w-0 flex-1 flex-col gap-[12px] p-[18px] lg:max-2xl:p-[12px]"><Skeleton className="h-[13px] w-[72px]" /><Skeleton className="h-[18px] w-[48%]" /><Skeleton className="h-[13px] w-[75%]" /><div className="mt-[4px] flex gap-[10px] border-t border-white/[0.06] pt-[12px]"><Skeleton className="h-[12px] w-[75px]" /><Skeleton className="h-[12px] w-[90px]" /></div></div>
    </div>)}
  </div>;
}

export function ReportWorkspaceLoading() {
  return <div role="status" aria-label="리포트를 불러오는 중" className="flex min-h-[500px] gap-[28px] py-[28px] lg:max-2xl:min-h-[420px] lg:max-2xl:gap-[22px] lg:max-2xl:py-[22px]">
    <div className="hidden w-[200px] shrink-0 flex-col gap-[18px] border-r border-white/[0.07] pr-[24px] md:flex"><Skeleton className="h-[36px] w-[75%]" />{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-[34px] w-full" />)}</div>
    <div className="flex min-w-0 flex-1 flex-col gap-[20px] lg:max-2xl:p-[16px]"><Skeleton className="h-[13px] w-[35%]" /><Skeleton className="h-[32px] w-[45%]" /><Skeleton className="h-[15px] w-[65%]" /><div className="mt-[18px] flex flex-col gap-[14px] border-t border-white/[0.07] pt-[24px]"><Skeleton className="h-[22px] w-[30%]" /><Skeleton className="h-[14px] w-full" /><Skeleton className="h-[14px] w-[88%]" /></div><div className="grid grid-cols-3 gap-[12px] pt-[16px]">{[0, 1, 2].map(index => <Skeleton key={index} className="h-[78px] w-full" />)}</div></div>
  </div>;
}

export function ProfileEditLoading() {
  return <div className="profile-edit desktop-content" role="status" aria-label="프로필 편집 정보를 불러오는 중"><Skeleton className="h-[14px] w-[100px]" /><div className="mt-[28px] flex items-center justify-between gap-4 lg:max-2xl:gap-[14px]"><div className="flex w-full flex-col gap-[12px]"><Skeleton className="h-[30px] w-[180px]" /><Skeleton className="h-[14px] w-[280px] max-w-full" /></div><Skeleton className="h-[40px] w-[90px] shrink-0" /></div><div className="mt-[32px] flex flex-col gap-[18px] lg:max-2xl:gap-[14px] border-t border-white/[0.07] pt-[28px]"><Skeleton className="h-[20px] w-[110px]" /><Skeleton className="h-[80px] w-[80px] rounded-full" />{[0, 1, 2].map(index => <div key={index} className="flex flex-col gap-[10px]"><Skeleton className="h-[14px] w-[90px]" /><Skeleton className="h-[48px] w-full" /></div>)}</div></div>;
}

export function ReportListLoading({ view }: { view: 'list' | 'grid' }) {
  return <div role="status" aria-label="리포트 목록을 불러오는 중" className={view === 'grid' ? 'grid grid-cols-1 gap-[24px] sm:grid-cols-2 lg:grid-cols-3 lg:max-2xl:gap-[18px]' : 'flex flex-col'}>
    {Array.from({ length: 3 }, (_, index) => view === 'grid' ? <div key={index} className="flex h-[200px] lg:max-2xl:h-[180px] flex-col justify-end rounded-xl border border-white/[0.08] bg-[var(--surface-filter)] p-[20px]"><Skeleton className="h-[18px] w-[55%]" /><Skeleton className="mt-[12px] h-[12px] w-[34%]" /></div> : <div key={index} className="flex min-h-[70px] lg:max-2xl:min-h-[64px] items-center gap-[16px] border-b border-white/[0.07] px-[16px]"><Skeleton className="h-[36px] w-[42px]" /><Skeleton className="h-[15px] w-[34%]" /><Skeleton className="ml-auto h-[13px] w-[90px]" /></div>)}
  </div>;
}
