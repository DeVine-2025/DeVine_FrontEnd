import ReportFolder from './ReportFolder';
import { getReportDetail, getReportMain } from '@apis/reports';
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowRight, CalendarDays, FileText, Star } from 'lucide-react';
import type { ReportFolderGroup } from './groupReportFolders';
export default function ReportFolderEntry({ group, view = 'grid', favorite, onToggleFavorite }: { favorite: boolean; onToggleFavorite: () => void; group: ReportFolderGroup; view?: 'grid' | 'list' }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const { getToken, isSignedIn } = useAuth();
  const first = group.reports[0];
  const isMain = first.reportType === 'MAIN';
  const { data: companion } = useQuery({
    queryKey: ['report-detail', first.gitRepoId, isMain ? 'DETAIL' : 'MAIN'],
    queryFn: async () => {
      const token = (await getToken()) ?? undefined;
      return isMain ? getReportDetail(first.gitRepoId, token) : getReportMain(first.gitRepoId, token);
    },
    enabled: !!first.gitRepoId && !!isSignedIn, staleTime: 5 * 60 * 1000, retry: false,
  });
  const availableReports = [...group.reports];
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
    description: `${report.reportType === 'MAIN' ? '종합 분석' : '상세 분석'} · ${new Date(report.createdAt).toLocaleDateString('ko-KR')}`,
    to: `/report/detail/${report.gitRepoId}?type=${encodeURIComponent(report.reportType)}`,
  }));
  const date = new Date(first.createdAt);
  if (view === 'list') return <article className="report-folder-row-wrap">
    <button className="report-favorite report-favorite-list" aria-label="즐겨찾기" aria-pressed={favorite} onClick={onToggleFavorite}><Star size={20} fill={favorite ? 'currentColor' : 'none'}/></button><button type="button" className="report-folder-row" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
      <span className="report-list-folder-icon" aria-hidden="true"><span /></span>
      <span className="report-row-title"><strong>{first.repoName.split('/').pop()}</strong><span><FileText size={16} aria-hidden="true" /> GitHub 분석 리포트</span></span>
      <span className="report-row-date"><CalendarDays size={18} aria-hidden="true" /> 최종 업데이트 {Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('ko-KR')}</span>
      <span className="report-row-count"><FileText size={18} aria-hidden="true" /> 리포트 {documents.length}개</span>
      <ArrowRight className="report-row-arrow" size={21} aria-hidden="true" />
    </button>
    {expanded && <div className="report-row-documents">{documents.map(document => <Link key={document.id} to={document.to}><FileText size={16} /> <span>{document.title} 리포트 <small>{document.description}</small></span><ArrowRight size={16} /></Link>)}</div>}
  </article>;
  return <ReportFolder
    name={first.repoName.split('/').pop() || first.repoName}
    date={Number.isNaN(date.getTime()) ? undefined : date.toLocaleDateString('ko-KR')}
    reportHref={documents[0]?.to}
    documents={documents.map(document => ({ ...document, href: document.to }))}
    favorite={favorite}
    onFavoriteChange={onToggleFavorite}
    onDocumentClick={href => navigate(href)}
  />;
}
