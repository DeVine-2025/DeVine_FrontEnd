import type { TechstackDto } from '@t/profileCard.types';
import { myInfoQueries } from '@apis/myInfo/myInfo-queries';
import { reportQueries } from '@apis/report/report-queries';
import MyBottomSection, { type ProjectTab } from '@components/myProject/MyBottomSection';
import CustomGithubCalendar from '@components/profileDetail/CustomGithubCalendar';
import TechStackBadges from '@components/cards/TechStackBadges';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { ArrowRight, ExternalLink, FileText, Folder, GitBranch, Layers, Link2, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function MyInfoProfile() {
  const [params] = useSearchParams();
  const tab = params.get('tab');
  const overview = tab !== 'projects' && tab !== 'reports';
  const [year, setYear] = useState(new Date().getFullYear());
  const [projectTab, setProjectTab] = useState<ProjectTab>('ongoing');
  const { data: profile } = useQuery(myInfoQueries.profile());
  const { data: skills } = useQuery(myInfoQueries.getMyTechStacks());
  const { data: contributions } = useQuery(myInfoQueries.getMyContributions(year));
  const repos = useInfiniteQuery(myInfoQueries.reposInfinite());
  const { data: reports } = useQuery(reportQueries.report());

  const activity = contributions?.result;
  const activityRows = Array.isArray(activity)
    ? activity
    : (activity as { contributionList?: typeof activity } | undefined)?.contributionList;
  const repositories = repos.data?.pages.flatMap(page => page.result?.content ?? []) ?? [];
  const reportRows = [...(reports?.result?.reports ?? [])].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const techStacks = [...new Set(((skills?.result?.techstacks ?? []) as TechstackDto[]).filter(stack => stack.genre != null).map(stack => stack.name))];

  return (
    <div className={overview ? 'my-info-dashboard' : 'my-info-dashboard my-info-dashboard--single'}>
      <div className="my-info-column">
        {overview && (
          <section className="my-info-panel my-info-activity">
            <h2><GitBranch size={20} aria-hidden="true" /> GitHub 활동</h2>
            <CustomGithubCalendar data={activityRows ?? []} year={year} onYearChange={setYear} />
          </section>
        )}
        {tab !== 'reports' && (
          <section className="my-info-panel">
            <header className="my-info-panel-header">
              <h2><Layers size={20} aria-hidden="true" /> {overview ? 'GitHub 프로젝트' : 'GitHub 저장소'}</h2>
              {overview && <Link to="/my-info?tab=projects">전체 보기 <ArrowRight size={16} aria-hidden="true" /></Link>}
            </header>
            {repositories.length ? (
              <div className="my-info-repos">
                {(overview ? repositories.slice(0, 2) : repositories).map(repo => (
                  <article key={repo.gitRepoId} className="my-info-repo">
                    <h3><Folder size={18} aria-hidden="true" /> {repo.name}</h3>
                    {repo.description && <p>{repo.description}</p>}
                    {/^https?:\/\//i.test(repo.gitUrl) && (
                      <a href={repo.gitUrl} target="_blank" rel="noreferrer" aria-label={repo.name + ' GitHub에서 보기'}><ExternalLink size={16} aria-hidden="true" /></a>
                    )}
                  </article>
                ))}
              </div>
            ) : <p className="my-info-muted">{repos.isPending ? '저장소를 불러오는 중이에요.' : '표시할 저장소가 없어요.'}</p>}
            {!overview && repos.hasNextPage && (
              <button className="my-info-control my-info-load" type="button" disabled={repos.isFetchingNextPage} onClick={() => void repos.fetchNextPage()}>
                {repos.isFetchingNextPage ? '불러오는 중…' : '저장소 더 보기'}
              </button>
            )}
          </section>
        )}
        {tab === 'projects' && (
          <MyBottomSection projectTab={projectTab} onChangeProjectTab={setProjectTab} />
        )}
        {tab !== 'projects' && (
          <section className="my-info-panel">
            <header className="my-info-panel-header">
              <h2><FileText size={20} aria-hidden="true" /> {overview ? '최근 리포트' : '내 리포트'}</h2>
              {overview && <Link to="/my-info?tab=reports">전체 보기 <ArrowRight size={16} aria-hidden="true" /></Link>}
            </header>
            {reportRows.length ? (
              <ul className="my-info-report-list">
                {(overview ? reportRows.slice(0, 3) : reportRows).map(report => {
                  const type = report.reportType === 'SUB' ? 'DETAIL' : report.reportType;
                  return <li key={report.reportId}>
                    <Link to={'/report/detail/' + report.gitRepoId + '?type=' + encodeURIComponent(type) + '&isOwner=mine'}>
                      <span className="my-info-report-badge">{type === 'MAIN' ? '메인' : '상세'}</span>
                      <strong>{report.repoName}</strong>
                      {Number.isFinite(Date.parse(report.createdAt)) && <time dateTime={report.createdAt}>{new Date(report.createdAt).toLocaleDateString('ko-KR')}</time>}
                      <ExternalLink size={16} aria-hidden="true" />
                    </Link>
                  </li>;
                })}
              </ul>
            ) : <p className="my-info-muted">표시할 리포트가 없어요.</p>}
          </section>
        )}
      </div>
      {overview && (
        <aside className="my-info-column" aria-label="프로필 부가 정보">
          <section className="my-info-panel">
            <h2><Link2 size={20} aria-hidden="true" /> 연결된 계정</h2>
            <dl className="my-info-accounts">
              {['GitHub', 'LinkedIn', 'Email'].map(label => {
                const contact = profile?.result?.contacts?.find(item => item.type.toUpperCase() === label.toUpperCase());
                const Icon = label === 'Email' ? Mail : label === 'GitHub' ? GitBranch : Link2;
                return <div key={label}>
                  <dt><Icon size={16} aria-hidden="true" /> {label}</dt>
                  <dd>{contact?.value || <Link to={label === 'GitHub' ? '/my-info/setting' : '/profile-edit'}>등록하기 <ArrowRight size={14} aria-hidden="true" /></Link>}</dd>
                </div>;
              })}
            </dl>
          </section>
          <section className="my-info-panel">
            <h2><Layers size={20} aria-hidden="true" /> 보유 스택</h2>
            {techStacks.length ? <TechStackBadges stacks={techStacks} /> : <p className="my-info-muted">등록한 기술 스택이 없어요.</p>}
          </section>
        </aside>
      )}
    </div>
  );
}
