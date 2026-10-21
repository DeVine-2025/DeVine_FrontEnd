import TicketIcon from '@assets/icons/ticket-neon.svg?react';
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
      <div className="report-analysis-hero">
        <div className="report-analysis-copy">
          <span className="report-hero-eyebrow">DEVINE REPORT</span>
          <h1 id="report-hero-title">프로젝트의 모든 기록을,<br/><span>하나의 리포트로.</span></h1>
          <p>GitHub 레포지토리를 분석해 구현 기능부터 기술 스택, 개선점까지 정리해 드려요.</p>
          <div className="report-analysis-actions">
            <Link to="/report/create" className="report-hero-cta">리포트 생성하기 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></Link>
            <div className="report-analysis-credits" role="status">
              <span className="report-analysis-ticket" aria-hidden="true"><TicketIcon /></span>
              <div className="report-analysis-credit-copy">
              {canReadCredits && <div className="report-analysis-credit-balance"><span>남은 이용권</span>{typeof remainingCredits === 'number' ? <strong>{remainingCredits.toLocaleString('ko-KR')}<small>장</small></strong> : <span>{creditsError ? '확인 불가' : '확인 중…'}</span>}</div>}
              </div>
            </div>
          </div>
        </div>
        <img className="report-analysis-art" src="/images/report-analysis-illustration.png" width="1536" height="1024" alt="" />
      </div>
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
