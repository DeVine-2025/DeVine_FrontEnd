import { reportQueries } from '@apis/report/report-queries';
import { myCreditsQuery } from '@apis/payment/payment-queries';
import { useAuth } from '@clerk/clerk-react';
import { useAuthMe } from '@hooks/useAuthMe';
import ReportCard from '@components/report/ReportCard';
import { ReportCardSkeletonList } from '@components/report/ReportCardSkeleton';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const ReportPage = () => {
  const [sort, setSort] = useState('newest');
  const { isSignedIn } = useAuth();
  const { data: memberStatus } = useAuthMe();
  const canReadCredits = isSignedIn === true && memberStatus?.isRegistered === true;
  const { data: credits, isError: creditsError } = useQuery(myCreditsQuery(canReadCredits));
  const remainingCredits = canReadCredits ? credits?.remainingCount : undefined;
  const { data, isPending, isError, refetch, isFetching } = useQuery(reportQueries.report());
  const reports = data?.result?.reports ?? [];
  const visibleReports = [...reports].sort((a, b) => {
      const dateA = Date.parse(a.createdAt) || 0;
      const dateB = Date.parse(b.createdAt) || 0;
      return sort === 'newest' ? dateB - dateA || b.reportId - a.reportId : dateA - dateB || a.reportId - b.reportId;
    });

  return <div className="report-library">
    <section className="report-showcase" aria-labelledby="report-hero-title">
      <div className="report-showcase-intro">
        <div className="report-showcase-copy">
          <span className="report-hero-eyebrow">MY REPORTS</span>
          <h1 id="report-hero-title">경험을 정리하고,<br/>가능성을 발견하세요.</h1>
          <p>GitHub 프로젝트가 나만의 리포트가 됩니다.</p>
        </div>
        <img className="report-showcase-art" src="/images/report-folder-illustration.png" width="1536" height="1024" alt="" />
      </div>
      <div className="report-launch-bar">
        <svg className="report-launch-icon" width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 32V8a3 3 0 0 1 3-3h9l5 6h12a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z"/><path d="M20 18v11m-5-5.5h10"/></svg>
        <div className="report-launch-copy"><h2>새로운 리포트</h2><p>프로젝트 주소로 분석을 시작하세요.</p></div>
        <div className="report-launch-actions">
          {canReadCredits && <div className="report-credit-status" role="status">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h16v5a2 2 0 0 0 0 4v5H4v-5a2 2 0 0 0 0-4V5Z"/><path d="M15 8v2m0 4v2"/></svg>
            <span>{typeof remainingCredits === 'number' ? <>남은 이용권 <strong>{remainingCredits.toLocaleString('ko-KR')}장</strong></> : creditsError ? '이용권 수량 확인 불가' : '이용권 확인 중…'}</span>
          </div>}
          <Link to="/report/create" className="report-hero-cta">새 리포트 만들기 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></Link>
        </div>
      </div>
      <div className="report-purchase-row"><Link to="/pay">이용권 구매 <span aria-hidden="true">↗</span></Link></div>
    </section>
    <section className="report-library-results" aria-labelledby="recent-reports-heading">
      <div className="report-library-toolbar"><h2 id="recent-reports-heading">내 리포트 {!isPending && !isError && <span className="report-count-badge">{reports.length}</span>}</h2>
        <select aria-label="리포트 정렬" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">최신순</option><option value="oldest">오래된순</option></select>
      </div>
      {isPending ? <div className="report-list-grid"><ReportCardSkeletonList count={2}/></div> : isError ? <div className="report-library-empty" role="status">리포트 목록을 불러오지 못했어요.<button type="button" className="report-library-retry" disabled={isFetching} onClick={() => { void refetch(); }}>{isFetching ? '불러오는 중…' : '다시 시도'}</button></div> : visibleReports.length ?
        <div className="report-list-grid">{visibleReports.map((report) => <ReportCard key={report.reportId} reportId={report.reportId} gitRepoId={report.gitRepoId} type="main" label={report.reportType} title={report.repoName} description={report.repoDescription} createdAt={report.createdAt}/>)}</div> :
        <p className="report-library-empty">아직 생성한 리포트가 없어요. 첫 리포트를 만들어 보세요.</p>}
    </section>
  </div>;
};

export default ReportPage;
