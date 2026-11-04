import ReportFolder from './ReportFolder';
import { getReportDetail, getReportMain } from '@apis/reports';
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FileText, Folder, MoreHorizontal } from 'lucide-react';
import type { ReportFolderGroup } from './groupReportFolders';
export default function ReportFolderEntry({ group, view = 'grid', sample = false }: { group: ReportFolderGroup; view?: 'grid' | 'list'; sample?: boolean }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAbove, setMenuAbove] = useState(false);
  const rowRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    if (!menuOpen || !menuRef.current) return;
    const menu = menuRef.current.querySelector<HTMLElement>('.report-row-menu');
    if (menu && menuButtonRef.current) setMenuAbove(menuButtonRef.current.getBoundingClientRect().bottom + menu.offsetHeight + 5 > window.innerHeight - 12);
  }, [menuOpen]);
  useEffect(() => {
    if (!menuOpen) return;
    const onOutside = (event: PointerEvent) => { if (!rowRef.current?.contains(event.target as Node)) setMenuOpen(false); };
    const onEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenuOpen(false); menuButtonRef.current?.focus(); } };
    document.addEventListener('pointerdown', onOutside);
    document.addEventListener('keydown', onEscape);
    return () => { document.removeEventListener('pointerdown', onOutside); document.removeEventListener('keydown', onEscape); };
  }, [menuOpen]);
  const { getToken, isSignedIn } = useAuth();
  const first = group.reports[0];
  const isMain = first.reportType === 'MAIN';
  const { data: companion } = useQuery({
    queryKey: ['report-detail', first.gitRepoId, isMain ? 'DETAIL' : 'MAIN'],
    queryFn: async () => {
      const token = (await getToken()) ?? undefined;
      return isMain ? getReportDetail(first.gitRepoId, token) : getReportMain(first.gitRepoId, token);
    },
    enabled: !sample && !!first.gitRepoId && !!isSignedIn && !group.reports.some(report => isMain ? report.reportType !== 'MAIN' : report.reportType === 'MAIN'), staleTime: 5 * 60 * 1000, retry: false,
  });
  const availableReports = [...group.reports].sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0) || b.reportId - a.reportId);
  // Offer an existing repository report through its existing endpoint, without merging analysis records.
  if (companion?.gitRepoId === first.gitRepoId && !availableReports.some(report => report.reportId === companion.reportId)) {
    availableReports.push({ ...first, reportId: companion.reportId, reportType: companion.reportType, createdAt: companion.createdAt });
  }
  const selectedReports = [
    availableReports.find(report => report.reportType === 'MAIN'),
    availableReports.find(report => report.reportType !== 'MAIN'),
  ].filter((report): report is NonNullable<typeof report> => report !== undefined);
  const documents = selectedReports.map(report => ({
    id: String(report.reportId), title: report.reportType === 'MAIN' ? '메인' : '상세',
    description: sample ? '샘플 리포트' : `${report.reportType === 'MAIN' ? '종합 분석' : '상세 분석'} · ${new Date(report.createdAt).toLocaleDateString('ko-KR')}`,
    to: `/report/detail/${report.gitRepoId}?type=${report.reportType === 'MAIN' ? 'MAIN' : 'DETAIL'}${sample ? '&preview=sample' : ''}`,
  }));
  const date = new Date(first.createdAt);
  if (view === 'list') return <article ref={rowRef} className={`report-compact-row ${menuOpen ? 'is-selected' : ''}`}>
    <button type="button" className="report-row-main" aria-label={`${first.repoName} 리포트 선택`} aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}><span className="report-compact-identity"><Folder className="report-list-folder" aria-hidden="true" /><strong>{first.repoName.split('/').pop() || first.repoName}</strong></span>
    <time className="report-compact-date" dateTime={Number.isNaN(date.getTime()) ? undefined : date.toISOString()}>{Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('ko-KR')}</time>
    </button><div className="report-row-menu-wrap" ref={menuRef}><button ref={menuButtonRef} type="button" className="report-row-menu-trigger" aria-label={`${first.repoName} 리포트 메뉴`} aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}><MoreHorizontal aria-hidden="true" /></button>{menuOpen && <div className={`report-row-menu ${menuAbove ? 'opens-above' : ''}`} aria-label="리포트 선택">{documents.map(document => <Link key={document.id} to={document.to} state={{ fromReportFolder: true }}><FileText aria-hidden="true" />{document.title} 리포트 보기</Link>)}</div>}</div>
  </article>;
  return <ReportFolder
    name={first.repoName.split('/').pop() || first.repoName}
    date={Number.isNaN(date.getTime()) ? undefined : date.toLocaleDateString('ko-KR')}
    reportHref={documents[0]?.to}
    documents={documents.map(document => ({ ...document, href: document.to }))}
    onDocumentClick={href => navigate(href, { state: { fromReportFolder: true } })}
  />;
}
