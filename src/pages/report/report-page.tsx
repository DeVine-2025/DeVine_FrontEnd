import TicketIcon from '@assets/icons/ticket-neon.svg?react';
import { reportQueries } from '@apis/report/report-queries';
import { myCreditsQuery } from '@apis/payment/payment-queries';
import { useAuth } from '@clerk/clerk-react';
import { useAuthMe } from '@hooks/useAuthMe';
import ReportFolderEntry from '@components/report/folder/ReportFolderEntry';
import { groupReportFolders } from '@components/report/folder/groupReportFolders';
import '@components/report/report-card.css';
import './report-library-redesign.css';
import { ReportCardSkeletonList } from '@components/report/ReportCardSkeleton';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Info, Plus } from 'lucide-react';
import ViewToggle from '@components/common/ViewToggle';
import SortMenu from '@components/common/SortMenu';
import { useElasticUnderline } from '@hooks/useElasticUnderline';
import type { ReportFolderGroup } from '@components/report/folder/groupReportFolders';

const sampleGroup: ReportFolderGroup = { key: 'sample:eternal-fe', reports: ['MAIN', 'DETAIL'].map((reportType, i) => ({ reportId: -1 - i, gitRepoId: 178, reportType, visibility: 'PRIVATE', repoName: 'Eternal-FE', repoDescription: '샘플 리포트', createdAt: '2026-11-03T00:00:00+09:00' })) };

const ReportPage = () => {
  const [tab, setTab] = useState('mine');
  const { navRef, indicatorRef } = useElasticUnderline(tab, 'button[aria-pressed="true"]');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const { isSignedIn } = useAuth();
  const { data: memberStatus } = useAuthMe();
  const canReadCredits = isSignedIn === true && memberStatus?.isRegistered === true;
  const { data: credits } = useQuery(myCreditsQuery(canReadCredits));
  const remainingCredits = canReadCredits ? credits?.remainingCount : undefined;
  const { data, isPending, isError, refetch, isFetching } = useQuery(reportQueries.report());
  const reports = data?.result?.reports ?? [];
  const visibleReports = [...reports].sort((a, b) => {
      const dateA = Date.parse(a.createdAt) || 0;
      const dateB = Date.parse(b.createdAt) || 0;
      return sort === 'newest' ? dateB - dateA || b.reportId - a.reportId : dateA - dateB || a.reportId - b.reportId;
    });

  const filteredGroups = groupReportFolders(visibleReports).filter(() => tab !== 'shared');
  const showSample = import.meta.env.DEV && tab !== 'shared' && !reports.some(report => report.repoName.split('/').pop()?.toLowerCase() === 'eternal-fe');

  return <div className="report-library">
    <header className="report-compact-header"><div className="report-library-heading-copy"><h1>리포트</h1><p>프로젝트의 분석 결과를 한곳에서 관리하세요.</p></div><div className="report-header-actions"><Link className="report-credit-pill" to="/pay" aria-label={`이용권 ${remainingCredits == null ? '수량 확인 불가' : `${remainingCredits}장`} · 이용권 구매`}><TicketIcon className="report-credit-icon" aria-hidden="true" /><span>이용권 <strong>{remainingCredits == null ? '—' : `${remainingCredits}장`}</strong></span><ChevronRight className="report-credit-arrow" aria-hidden="true" /></Link><Link className="report-new-button" to="/report/create"><Plus size={18} aria-hidden="true"/> 리포트 생성</Link></div></header>

    <section className="report-library-results" aria-label="리포트 목록">
      <div className="report-library-toolbar"><nav ref={navRef} className="report-library-tabs" aria-label="리포트 분류"><button aria-pressed={tab === 'mine'} onClick={() => setTab('mine')}>내 리포트</button><button aria-pressed={tab === 'shared'} onClick={() => setTab('shared')}>공유된 리포트</button><span ref={indicatorRef} className="report-tabs-indicator" aria-hidden="true" /></nav>
        <div className="report-view-controls"><SortMenu label="리포트 정렬" value={sort} onChange={setSort} options={[{ value: 'newest', label: '최신순' }, { value: 'oldest', label: '오래된순' }]} /><ViewToggle value={view} onChange={setView} label="리포트 보기 방식" /></div>
      </div>
      {tab === 'shared' && <div className="report-shared-heading"><h2>공유된 리포트</h2><span className="report-shared-help"><button type="button" aria-label="공유된 리포트 안내" aria-describedby="shared-report-tooltip"><Info aria-hidden="true" /></button><span id="shared-report-tooltip" role="tooltip" className="report-shared-tooltip"><strong>공유된 리포트</strong><span>다른 사용자가 나에게 공유한<br />프로젝트 리포트를 확인할 수 있어요.</span></span></span></div>}
      {isPending && <div className="report-list-grid"><ReportCardSkeletonList count={2}/></div>}
      {isError && <div className="report-library-empty" role="status">리포트 목록을 불러오지 못했어요.<button type="button" className="report-library-retry" disabled={isFetching} onClick={() => { void refetch(); }}>{isFetching ? '불러오는 중…' : '다시 시도'}</button></div>}
      {view === 'list' && (showSample || (!isPending && !isError && filteredGroups.length > 0)) && <div className="report-list-head"><span>프로젝트</span><span>생성일</span><span aria-hidden="true" /></div>}
      <div className={view === 'grid' ? 'report-list-grid rf-grid' : 'report-folder-list'}>
        {showSample && <div className="report-folder-entrance"><ReportFolderEntry group={sampleGroup} sample view={view} /></div>}
        {!isError && !isPending && filteredGroups.map((group, index) => <div key={group.key} className="report-folder-entrance" style={{ animationDelay: `${Math.min(index + (showSample ? 1 : 0), 8) * 55}ms` }}><ReportFolderEntry group={group} view={view}/></div>)}
      </div>
      {!isPending && !isError && filteredGroups.length === 0 && !showSample && <p className="report-library-empty">아직 표시할 리포트가 없어요.</p>}
    </section>
  </div>;
};

export default ReportPage;
