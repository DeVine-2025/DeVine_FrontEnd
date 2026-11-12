import { myInfoQueries } from '@apis/myInfo/my-info.queries';
import { reportQueries } from '@apis/report/report-queries';
import ReportFolderEntry from '@components/report/folder/ReportFolderEntry';
import { groupReportFolders } from '@components/report/folder/groupReportFolders';
import '@components/report/report-card.css';
import '../report/report-library-redesign.css';
import '@components/tab/underline-tabs.css';
import { featuredProjects } from '../home/home-mock-data';
import MyBottomSection, { type ProjectTab } from '@components/myProject/MyBottomSection';
import CustomGithubCalendar from '@components/profileDetail/CustomGithubCalendar';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { ChevronLeft, ArrowRight, ExternalLink, Folder, CalendarDays, Zap, GitBranch } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useMockData } from '../../shared/config/data-mode';

const sampleStatusByTab = { ongoing: 'inProgress', recruiting: 'recruiting', done: 'completed' } as const;

function ActivitySkeleton() {
  return <div role="status" aria-label="GitHub 활동을 불러오는 중" className="my-info-activity-skeleton">
    <div className="flex items-center justify-between"><span className="my-info-skeleton h-[24px] w-[140px]" /><span className="my-info-skeleton h-[24px] w-[100px]" /></div>
    <div className="mt-[20px] grid grid-cols-1 gap-[12px] sm:grid-cols-3">{[0, 1, 2].map(index => <div key={index} className="flex h-[84px] items-center gap-[14px] rounded-xl border border-white/[0.07] px-[18px]"><span className="my-info-skeleton h-[42px] w-[42px] shrink-0" /><div className="flex flex-1 flex-col gap-[9px]"><span className="my-info-skeleton h-[11px] w-[60%]" /><span className="my-info-skeleton h-[20px] w-[42%]" /></div></div>)}</div>
    <div aria-hidden="true" className="mt-[20px] rounded-xl border border-white/[0.07] bg-white/[0.015] p-[16px] sm:p-[20px]">
      <div className="my-info-skeleton-months">{Array.from({ length: 12 }, (_, index) => <span key={index} className="my-info-skeleton h-[9px] w-[22px]" />)}</div>
      <div className="my-info-skeleton-calendar">{Array.from({ length: 371 }, (_, index) => <span key={index} className="my-info-skeleton-calendar-cell" />)}</div>
      <div className="mt-[14px] flex justify-end gap-[4px]">{Array.from({ length: 5 }, (_, index) => <span key={index} className="my-info-skeleton h-[10px] w-[10px]" />)}</div>
      <div className="mt-[20px] border-t border-white/[0.08] pt-[18px]"><div className="flex items-center justify-between"><span className="my-info-skeleton h-[15px] w-[110px]" /><span className="my-info-skeleton h-[28px] w-[96px]" /></div><span className="my-info-skeleton mt-[8px] h-[10px] w-[145px]" />
        <div className="my-info-skeleton-chart">{[32, 48, 38, 68, 44, 58, 30, 52, 39, 64, 36, 46].map((height, index) => <div key={index} className="my-info-skeleton-chart-column"><span className="my-info-skeleton w-full max-w-[28px] rounded-t-[4px]" style={{ height: `${height}%` }} /><span className="my-info-skeleton h-[9px] w-[20px]" /></div>)}</div>
      </div>
    </div>
  </div>;
}

export default function MyInfoProfile() {
  const [params] = useSearchParams();
  const tab = params.get('tab');
  const overview = tab !== 'projects' && tab !== 'reports' && tab !== 'my-projects';
  const [year, setYear] = useState(new Date().getFullYear());
  const [activityView, setActivityView] = useState<'month' | 'weekday'>('month');
  const [projectTab, setProjectTab] = useState<ProjectTab>('ongoing');
  const { data: profile, isPending: profileLoading } = useQuery(myInfoQueries.profile());
  const contributionQuery = useQuery(myInfoQueries.getMyContributions(year));
  const previousContributionQuery = useQuery({ ...myInfoQueries.getMyContributions(year - 1), enabled: overview });
  const contributions = contributionQuery.data;
  const repos = useInfiniteQuery(myInfoQueries.reposInfinite());
  const { data: reports, isPending: reportsLoading } = useQuery(reportQueries.report());

  const activity = contributions?.result;
  const activityRows = Array.isArray(activity)
    ? activity
    : (activity as { contributionList?: typeof activity } | undefined)?.contributionList;
  const hasActivityData = contributions?.isSuccess === true && Array.isArray(activityRows);
  const previousActivity = previousContributionQuery.data?.result;
  const previousRows = Array.isArray(previousActivity) ? previousActivity : (previousActivity as { contributionList?: typeof previousActivity } | undefined)?.contributionList;
  const activitySummary = useMemo(() => {
    const daily = new Map<string, number>();
    for (const item of activityRows ?? []) {
      if (!new RegExp(`^${year}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$`).test(item.date) || !Number.isFinite(item.count) || item.count < 0) continue;
      daily.set(item.date, item.count);
    }
    const months = Array.from({ length: 12 }, () => 0);
    const monthlyActiveDays = Array.from({ length: 12 }, () => 0);
    const weekdays = Array.from({ length: 7 }, () => 0);
    const weekdayActiveDays = Array.from({ length: 7 }, () => 0);
    for (const [date, count] of daily) {
      months[Number(date.slice(5, 7)) - 1] += count;
      weekdays[(new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7] += count;
      if (count > 0) {
        monthlyActiveDays[Number(date.slice(5, 7)) - 1] += 1;
        weekdayActiveDays[(new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7] += 1;
      }
    }
    const total = months.reduce((sum, count) => sum + count, 0);
    const max = Math.max(...months);
    return { months, weekdays, monthlyActiveDays, weekdayActiveDays, total, activeDays: [...daily.values()].filter((count) => count > 0).length, max };
  }, [activityRows, year]);
  const yearComparison = useMemo(() => {
    if (previousContributionQuery.data?.isSuccess !== true || !Array.isArray(previousRows) || !hasActivityData) return null;
    const now = new Date();
    const cutoff = year === now.getFullYear() ? `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}` : '12-31';
    const summarize = (rows: typeof activityRows, targetYear: number) => {
      const daily = new Map<string, number>();
      for (const item of rows ?? []) {
        if (item.date.startsWith(`${targetYear}-`) && item.date.slice(5) <= cutoff && Number.isFinite(item.count) && item.count >= 0) daily.set(item.date, item.count);
      }
      return { total: [...daily.values()].reduce((sum, count) => sum + count, 0), days: [...daily.values()].filter(count => count > 0).length };
    };
    const current = summarize(activityRows, year);
    const previous = summarize(previousRows, year - 1);
    return { percent: previous.total > 0 ? Math.round((current.total - previous.total) / previous.total * 100) : null, days: current.days - previous.days, label: year === now.getFullYear() ? '전년 동기 대비' : '전년 대비' };
  }, [activityRows, previousRows, previousContributionQuery.data, hasActivityData, year]);
  const repositories = repos.data?.pages.flatMap(page => page.result?.content ?? []) ?? [];

  const reportRows = [...(reports?.result?.reports ?? [])].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const reportGroups = groupReportFolders(reportRows);

  return (
    <div className="my-info-dashboard">
      <div className="min-w-0">
        {!overview && tab !== 'my-projects' && (
          <Link className="my-info-back" to="/my-info" aria-label="프로필로 돌아가기" title="프로필로 돌아가기">
            <ChevronLeft size={24} strokeWidth={3} aria-hidden="true" />
          </Link>
        )}
        {overview && (
          <section className="my-info-panel my-info-intro">
            <h2>소개</h2>
            {profileLoading ? <span role="status" aria-label="소개를 불러오는 중" className="my-info-skeleton mt-[10px] block h-[15px] w-[55%]" /> : <p>{profile?.result?.member?.body || '아직 작성한 소개가 없어요.'}</p>}
          </section>
        )}
        {tab !== 'reports' && tab !== 'my-projects' && (
        <section className="my-info-panel">
          <header className="my-info-panel-header mb-[16px] flex items-center justify-between gap-[12px]">
            <h2>{overview ? '대표 프로젝트' : 'GitHub 저장소'}</h2>
            {overview && <Link to="/my-info?tab=projects">전체 보기 <ArrowRight size={16} aria-hidden="true" /></Link>}
          </header>
          {repos.isPending ? <div role="status" aria-label="저장소를 불러오는 중" className="my-info-repos">{[0, 1].map(index => <div key={index} className="flex min-h-[76px] items-center gap-[14px] rounded-xl border border-white/[0.07] p-[14px]"><span className="my-info-skeleton h-[40px] w-[40px] shrink-0" /><span className="my-info-skeleton h-[15px] w-[48%]" /></div>)}</div> : repositories.length ? (
            <div className="my-info-repos">
              {(overview ? repositories.slice(0, 2) : repositories).map(repo => (
                <article key={repo.gitRepoId} className="my-info-repo">
                  <span className="my-info-repo-icon"><Folder size={21} aria-hidden="true" /></span>
                  <div className="my-info-repo-copy">
                    <h3>{repo.name}</h3>
                    {repo.description?.trim() && <p>{repo.description}</p>}
                  </div>
                  {/^https?:\/\//i.test(repo.gitUrl) && (
                    <a className="my-info-repo-link" href={repo.gitUrl} target="_blank" rel="noreferrer" aria-label={repo.name + ' GitHub에서 보기'}>
                      <ExternalLink size={17} aria-hidden="true" />
                    </a>
                  )}
                </article>
              ))}
            </div>
          ) : <p className="my-info-muted">{repos.isError ? '저장소를 불러오지 못했어요.' : '표시할 저장소가 없어요.'}</p>}
          {!overview && repos.hasNextPage && (
            <button className="my-info-control my-info-load" type="button" disabled={repos.isFetchingNextPage} onClick={() => void repos.fetchNextPage()}>
              {repos.isFetchingNextPage ? '불러오는 중…' : '저장소 더 보기'}
            </button>
          )}
        </section>
        )}
        {tab === 'my-projects' && (
          <div className="my-info-panel my-info-project-status">
            <MyBottomSection
              projectTab={projectTab}
              onChangeProjectTab={setProjectTab}
              animatedTabs
              sampleProjects={useMockData
                ? featuredProjects.filter(project => project.status === sampleStatusByTab[projectTab])
                : undefined}
            />
          </div>
        )}
        {overview && (
          <section className="my-info-panel my-info-activity">
            {contributionQuery.isPending ? <ActivitySkeleton /> : hasActivityData ? (
              <>
                <CustomGithubCalendar data={activityRows} year={year} onYearChange={setYear} heading="GitHub 활동"
                  beforeCalendar={<div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label={`${year}년 GitHub 활동 요약`}>
                    {[
                      { label: '총 기여', value: `${activitySummary.total.toLocaleString()}회`, Icon: GitBranch, change: yearComparison?.percent, unit: '%' },
                      { label: '활동한 날', value: `${activitySummary.activeDays.toLocaleString()}일`, Icon: CalendarDays, change: yearComparison?.days, unit: '일' },
                      { label: '가장 활발한 달', value: activitySummary.max > 0 ? activitySummary.months.map((count, index) => count === activitySummary.max ? `${index + 1}월` : null).filter(Boolean).join(', ') : '—', Icon: Zap },
                    ].map(({ label, value, Icon, change, unit }) => <div key={label} className="my-info-activity-stat flex min-h-[84px] min-w-0 items-center gap-[14px] lg:max-2xl:min-h-[72px] lg:max-2xl:gap-[10px] rounded-xl border border-white/[0.09] bg-white/[0.025] px-[18px] py-[14px] lg:max-2xl:px-[12px] lg:max-2xl:py-[10px]">
                      <span className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-lg bg-[var(--project-accent)]/10 text-[var(--project-accent)]"><Icon size={22} aria-hidden="true" /></span>
                      <div className="min-w-0"><p className="text-[13px] leading-[1.4] text-[var(--text-secondary)]">{label}</p><p className="mt-[5px] text-[22px] leading-[1.2] font-semibold text-[var(--text-main)]">{value}</p></div>
                      {yearComparison && change != null && <div className="ml-auto shrink-0 text-right"><p className={`text-[12px] font-semibold ${change > 0 ? 'text-[#75d8a4]' : change < 0 ? 'text-[#f1a3a3]' : 'text-[var(--text-secondary)]'}`}>{change > 0 ? '▲ +' : change < 0 ? '▼ ' : ''}{change}{unit}</p><p className="mt-[3px] text-[10px] text-[var(--text-secondary)]">{yearComparison.label}</p></div>}
                    </div>)}
                  </div>}
                  afterCalendar={<div className="mt-[22px] border-t border-white/[0.08] pt-[18px]">
                    <div className="flex items-center justify-between gap-3">
                      <div><h3 className="text-[15px] font-semibold text-[var(--text-main)]">기여 활동 추이</h3><p className="mt-[5px] text-[12px] text-[var(--text-secondary)]">{activityView === 'month' ? '월별 기여량과 활동 변화' : '요일별 기여 활동'}</p></div>
                      <div className="flex rounded-lg border border-white/[0.08] bg-black/10 p-0.5" role="group" aria-label="활동 그래프 보기">
                        {([['month', '월별'], ['weekday', '요일별']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={activityView === value} onClick={() => setActivityView(value)} className={`rounded-md px-[12px] py-[6px] text-[12px] transition-colors ${activityView === value ? 'bg-[var(--project-accent)]/15 text-[var(--project-accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'}`}>{label}</button>)}
                      </div>
                    </div>
                    {(() => {
                      const values = activityView === 'month' ? activitySummary.months : activitySummary.weekdays;
                      const labels = activityView === 'month' ? values.map((_, index) => `${index + 1}월`) : ['월', '화', '수', '목', '금', '토', '일'];
                      const observedMonths = year === new Date().getFullYear() ? new Date().getMonth() + 1 : 12;
                      const average = activitySummary.total / observedMonths;
                      const chartData = values.map((count, index) => ({ label: labels[index], count: activityView === 'month' && index >= observedMonths ? null : count, trend: activityView === 'month' && index >= observedMonths ? null : count, activeDays: (activityView === 'month' ? activitySummary.monthlyActiveDays : activitySummary.weekdayActiveDays)[index], previous: activityView === 'month' && index > 0 ? values[index - 1] : null }));
                      return <div className="mt-[22px]" role="img" aria-label={`${year}년 ${activityView === 'month' ? '월별' : '요일별'} 기여: ${chartData.filter(item => item.count !== null).map(item => `${item.label} ${item.count}회`).join(', ')}`}>
                        <div className="mb-3 flex flex-wrap justify-end gap-x-5 gap-y-2 text-[12px] text-[var(--text-secondary)]"><span><span className="mr-2 inline-block h-[10px] w-[10px] rounded-sm bg-[var(--project-accent)]" />기여 횟수</span>{activityView === 'month' && <span><span className="mr-2 inline-block w-[16px] border-t border-dashed border-[#9094a3] align-middle" />월평균 {Math.round(average).toLocaleString()}회</span>}</div>
                        <div className="my-info-activity-chart h-[220px] lg:max-2xl:h-[clamp(174px,25svh,208px)] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 4" />
                              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#aeb5c2', fontSize: 12 }} tickMargin={12} interval={0} />
                              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#858b9b', fontSize: 11 }} width={42} tickCount={5} />
                              <Tooltip cursor={{ fill: 'rgba(166,155,255,0.05)' }} content={({ active, payload }) => {
                                const item = payload?.[0]?.payload as (typeof chartData)[number] | undefined;
                                if (!active || !item || item.count === null) return null;
                                const change = item.previous !== null && item.previous > 0 ? (item.count - item.previous) / item.previous * 100 : null;
                                return <div className="min-w-[150px] rounded-lg border border-white/[0.1] bg-[#171820] px-[14px] py-[12px] text-[12px] text-[#f2f4fc] shadow-xl"><p className="mb-[9px] font-semibold">{item.label}</p><div className="flex justify-between gap-5 py-[3px]"><span className="text-[#b5b7c2]">기여</span><span>{item.count.toLocaleString()}회</span></div><div className="flex justify-between gap-5 py-[3px]"><span className="text-[#b5b7c2]">활동일</span><span>{item.activeDays}일</span></div>{activityView === 'month' && <div className="flex justify-between gap-5 py-[3px]"><span className="text-[#b5b7c2]">전월 대비</span><span className={change === null ? 'text-[#858b9b]' : change > 0 ? 'text-[#75d8a4]' : change < 0 ? 'text-[#f1a3a3]' : 'text-[#b5b7c2]'}>{change === null ? '비교 불가' : `${change > 0 ? '+' : ''}${Math.round(change)}%`}</span></div>}</div>;
                              }} />
                              {activityView === 'month' && <ReferenceLine y={average} stroke="#9094a3" strokeOpacity={0.65} strokeDasharray="5 5" />}
                              <Bar dataKey="count" fill="#a69bff" fillOpacity={0.78} radius={[4, 4, 0, 0]} maxBarSize={30} isAnimationActive={false} legendType="none" />
                              <Line type="monotone" dataKey="trend" stroke="#b9adff" strokeOpacity={0.8} strokeWidth={1.5} dot={{ r: 2.5, fill: '#d5ceff', stroke: '#b9adff', strokeWidth: 1 }} activeDot={{ r: 4, fill: '#b9adff', stroke: '#17191f', strokeWidth: 2 }} isAnimationActive={false} legendType="none" />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </div>;
                    })()}
                  </div>}
                />
              </>
            ) : (
              <div>
                <div className="flex items-center justify-between gap-3"><h2>GitHub 활동</h2><div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]"><button type="button" aria-label="이전 연도" onClick={() => setYear(year - 1)}>‹</button><span>{year}년</span><button type="button" aria-label="다음 연도" disabled={year >= new Date().getFullYear()} onClick={() => setYear(year + 1)}>›</button></div></div>
                <p className="mt-6 text-sm text-[var(--text-secondary)]">{contributionQuery.isPending ? 'GitHub 활동을 불러오는 중이에요.' : 'GitHub 활동을 불러오지 못했어요.'}</p>
                {!contributionQuery.isPending && <button type="button" onClick={() => void contributionQuery.refetch()} className="mt-3 text-sm text-[var(--project-accent)]">다시 시도</button>}
              </div>
            )}
          </section>
        )}
        {tab !== 'projects' && tab !== 'my-projects' && (
          <section className="my-info-panel">
            <header className="my-info-panel-header mb-[16px] flex items-center justify-between gap-[12px]">
              <h2>내 리포트</h2>
              {overview && <Link to="/report">전체 보기 <ArrowRight size={16} aria-hidden="true" /></Link>}
            </header>
            {reportsLoading ? <div role="status" aria-label="리포트를 불러오는 중" className="flex flex-col gap-[14px] py-[12px]"><span className="my-info-skeleton h-[13px] w-[30%]" /><span className="my-info-skeleton h-[52px] w-full" /></div> : reportRows.length ? (
              <div className="report-library my-info-report-library">
                <div className="report-list-head"><span>프로젝트</span><span>생성일</span><span aria-hidden="true" /></div>
                <div className="report-folder-list">
                  {(overview ? reportGroups.slice(0, 2) : reportGroups).map(group => (
                    <ReportFolderEntry key={group.key} group={group} view="list" />
                  ))}
                </div>
              </div>
            ) : <p className="my-info-muted">표시할 리포트가 없어요.</p>}
          </section>
        )}
      </div>
    </div>
  );
}
