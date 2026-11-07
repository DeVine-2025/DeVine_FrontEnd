import { myInfoQueries } from '@apis/myInfo/myInfo-queries';
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
import { ChevronLeft, ArrowRight, ExternalLink, Folder } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const sampleStatusByTab = { ongoing: 'inProgress', recruiting: 'recruiting', done: 'completed' } as const;

export default function MyInfoProfile() {
  const [params] = useSearchParams();
  const tab = params.get('tab');
  const overview = tab !== 'projects' && tab !== 'reports' && tab !== 'my-projects';
  const [year, setYear] = useState(new Date().getFullYear());
  const [projectTab, setProjectTab] = useState<ProjectTab>('ongoing');
  const { data: profile } = useQuery(myInfoQueries.profile());
  const { data: contributions } = useQuery(myInfoQueries.getMyContributions(year));
  const repos = useInfiniteQuery(myInfoQueries.reposInfinite());
  const { data: reports } = useQuery(reportQueries.report());

  const activity = contributions?.result;
  const activityRows = Array.isArray(activity)
    ? activity
    : (activity as { contributionList?: typeof activity } | undefined)?.contributionList;
  const repositories = repos.data?.pages.flatMap(page => page.result?.content ?? []) ?? [];

  const reportRows = [...(reports?.result?.reports ?? [])].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const reportGroups = groupReportFolders(reportRows);

  return (
    <div className="my-info-dashboard">
      <div className="my-info-column">
        {!overview && tab !== 'my-projects' && (
          <Link className="my-info-back" to="/my-info" aria-label="프로필로 돌아가기" title="프로필로 돌아가기">
            <ChevronLeft size={24} strokeWidth={3} aria-hidden="true" />
          </Link>
        )}
        {overview && (
          <section className="my-info-panel my-info-intro">
            <h2>소개</h2>
            <p>{profile?.result?.member?.body || '아직 작성한 소개가 없어요.'}</p>
          </section>
        )}
        {tab !== 'reports' && tab !== 'my-projects' && (
        <section className="my-info-panel">
          <header className="my-info-panel-header">
            <h2>{overview ? '대표 프로젝트' : 'GitHub 저장소'}</h2>
            {overview && <Link to="/my-info?tab=projects">전체 보기 <ArrowRight size={16} aria-hidden="true" /></Link>}
          </header>
          {repositories.length ? (
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
          ) : <p className="my-info-muted">{repos.isPending ? '저장소를 불러오는 중이에요.' : '표시할 저장소가 없어요.'}</p>}
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
              sampleProjects={import.meta.env.DEV
                ? featuredProjects.filter(project => project.status === sampleStatusByTab[projectTab])
                : undefined}
            />
          </div>
        )}
        {overview && (
          <section className="my-info-panel my-info-activity">
            <CustomGithubCalendar data={activityRows ?? []} year={year} onYearChange={setYear} heading="GitHub 활동" />
          </section>
        )}
        {tab !== 'projects' && tab !== 'my-projects' && (
          <section className="my-info-panel">
            <header className="my-info-panel-header">
              <h2>내 리포트</h2>
              {overview && <Link to="/report">전체 보기 <ArrowRight size={16} aria-hidden="true" /></Link>}
            </header>
            {reportRows.length ? (
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
