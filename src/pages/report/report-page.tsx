import TicketIcon from '@assets/icons/ticket-neon.svg?react';
import { reportQueries } from '@apis/report/report-queries';
import { myCreditsQuery } from '@apis/payment/payment-queries';
import { useAuth } from '@clerk/clerk-react';
import { useAuthMe } from '@hooks/useAuthMe';
import ReportFolderEntry from '@components/report/folder/ReportFolderEntry';
import { groupReportFolders } from '@components/report/folder/groupReportFolders';
import '@components/report/report-card.css';
import { ReportCardSkeletonList } from '@components/report/ReportCardSkeleton';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LayoutGrid, List } from 'lucide-react';

const ReportPage = () => {
  const [tab, setTab] = useState('mine');
  const [favorites, setFavorites] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('devine-report-favorites') || '[]'); } catch { return []; } });
  const toggleFavorite = (key: string) => setFavorites(current => { const next = current.includes(key) ? current.filter(item => item !== key) : [...current, key]; localStorage.setItem('devine-report-favorites', JSON.stringify(next)); return next; });
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');
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
    <header className="report-compact-header"><div><h1>리포트</h1><p>프로젝트의 분석 결과를 한곳에서 관리하세요.</p></div><div className="report-header-actions"><div className="report-credit-pill"><TicketIcon /> 보유 이용권 <strong>{remainingCredits ?? '—'} 장</strong><Link to="/pay">이용권 구매</Link></div><Link className="report-new-button" to="/report/create"><Plus size={20}/> 리포트 생성하기</Link></div></header>
    {import.meta.env.DEV && <div className="report-sample-entry"><div className="report-sample-copy"><span className="report-sample-label">디자인 미리보기</span><strong>Eternal-FE · 이터널마케팅</strong><span>기존 분석 내용을 바탕으로 구성한 샘플 리포트</span></div><Link className="report-sample-action" to="/report/detail/178?type=MAIN&preview=sample">메인 리포트</Link><Link className="report-sample-action" to="/report/detail/178?type=DETAIL&preview=sample">상세 리포트</Link></div>}
    <section className="report-library-results" aria-labelledby="recent-reports-heading">
      <div className="report-library-toolbar"><nav className="report-library-tabs" aria-label="리포트 분류"><button aria-pressed={tab === 'mine'} onClick={() => setTab('mine')}>내 리포트 <span>{reports.length}</span></button><button aria-pressed={tab === 'shared'} onClick={() => setTab('shared')}>공유된 리포트 <span>0</span></button><button aria-pressed={tab === 'favorites'} onClick={() => setTab('favorites')}>즐겨찾기</button></nav>
        <div className="report-view-controls"><select aria-label="리포트 정렬" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">최신순</option><option value="oldest">오래된순</option></select><div className="report-view-toggle" aria-label="리포트 보기 방식"><button type="button" aria-label="그리드 보기" aria-pressed={view === 'grid'} onClick={() => setView('grid')}><LayoutGrid size={18} /></button><button type="button" aria-label="리스트 보기" aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={18} /></button></div></div>
      </div>
      {isPending ? <div className="report-list-grid"><ReportCardSkeletonList count={2}/></div> : isError ? <div className="report-library-empty" role="status">리포트 목록을 불러오지 못했어요.<button type="button" className="report-library-retry" disabled={isFetching} onClick={() => { void refetch(); }}>{isFetching ? '불러오는 중…' : '다시 시도'}</button></div> : visibleReports.length ?
        <div className={view === 'grid' ? "report-list-grid rf-grid" : "report-folder-list"}>{groupReportFolders(visibleReports).filter(group => tab !== 'shared' && (tab !== 'favorites' || favorites.includes(group.key))).map((group) => <ReportFolderEntry key={group.key} group={group} view={view} favorite={favorites.includes(group.key)} onToggleFavorite={() => toggleFavorite(group.key)}/>)}</div> :
        <p className="report-library-empty">아직 생성한 리포트가 없어요. 첫 리포트를 만들어 보세요.</p>}
    </section>
  </div>;
};

export default ReportPage;
