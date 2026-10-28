import { getReportDetail, getReportMain } from '@apis/reports';
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import InteractiveFolders from './InteractiveFolders';
import { useNavigate } from 'react-router-dom';
import type { ReportFolderGroup } from './groupReportFolders';
export default function ReportFolderEntry({ group }: { group: ReportFolderGroup }) {
  const navigate = useNavigate();
  const { getToken, isSignedIn } = useAuth();
  const first = group.reports[0];
  const isMain = first.reportType === 'MAIN';
  const { data } = useQuery({
    queryKey: ['report-detail', first.gitRepoId, isMain ? 'MAIN' : 'DETAIL'],
    queryFn: async () => { const token = (await getToken()) ?? undefined; return isMain ? getReportMain(first.gitRepoId, token) : getReportDetail(first.gitRepoId, token); },
    enabled: !!first.gitRepoId && !!isSignedIn, staleTime: 5 * 60 * 1000, retry: false,
  });
  let username = first.repoName.includes('/') ? first.repoName.split('/')[0] : 'GitHub 사용자';
  if (data?.gitRepoUrl) {
    try { const url = new URL(data.gitRepoUrl); if (url.hostname === 'github.com') username = url.pathname.split('/').filter(Boolean)[0] || username; } catch { /* Keep source label when the URL is unavailable. */ }
  }
  const documents = group.reports.map(report => ({
    id: String(report.reportId), title: report.reportType === 'MAIN' ? '종합 분석' : '상세 분석',
    description: report.reportType === 'MAIN' ? '프로젝트 구조와 핵심 성과' : '구현 기능과 코드 인사이트',
    to: `/report/detail/${report.gitRepoId}?type=${encodeURIComponent(report.reportType)}`,
  }));
  const date = new Date(first.createdAt);
  return <InteractiveFolders embedded onDocumentClick={to => navigate(to)} items={[{
    id: group.key,
    name: username,
    detail: `GitHub 분석 리포트 · ${documents.length}개`,
    category: Number.isNaN(date.getTime()) ? 'REPORT' : date.toLocaleDateString('ko-KR'),
    variant: 'ice',
    papers: [documents[0]?.title ?? '', documents[1]?.title ?? '', 'GitHub 분석 리포트'],
    documents,
  }]}/>;
}
