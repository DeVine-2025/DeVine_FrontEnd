import { getReportDetail, getReportMain } from '@apis/reports';
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { useId } from 'react';
import { Link } from 'react-router-dom';
import './report-card.css';

type ReportCardProps = {
  type: 'create' | 'main';
  gitRepoId?: number;
  reportId?: number;
  label?: string;
  title?: string;
  description?: string;
  isPublic?: boolean;
  createdAt?: string;
};

const ReportCard = ({ type, label, gitRepoId, title, description, createdAt }: ReportCardProps) => {
  const gradientId = useId();
  const { getToken, isSignedIn } = useAuth();
  const isMain = label === 'MAIN';
  const { data: report, isPending, isError } = useQuery({
    queryKey: ['report-detail', gitRepoId, isMain ? 'MAIN' : 'DETAIL'],
    queryFn: async () => {
      const token = (await getToken()) ?? undefined;
      return isMain ? getReportMain(gitRepoId!, token) : getReportDetail(gitRepoId!, token);
    },
    enabled: type !== 'create' && !!gitRepoId && !!isSignedIn,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (type === 'create') {
    return <Link to="/report/create" className="report-create-card">
      <span className="report-create-plus"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg></span>
      <strong>새 리포트 생성</strong>
      <p>프로젝트를 분석하여<br/>AI 기반 리포트를 생성하세요.</p>
    </Link>;
  }

  const main = report?.reportType === 'MAIN' ? report.content : undefined;
  const detail = report?.reportType === 'DETAIL' ? report.content : undefined;
  const scale = detail?.projectOverview?.projectScale;
  const fallback = isError ? '정보 없음' : isPending ? '불러오는 중' : '정보 없음';
  const formatCount = (value: number | undefined, unit: string) => typeof value === 'number' ? `${value.toLocaleString('ko-KR')}${unit}` : fallback;
  const mainScale = main?.projectInfo?.scale || main?.overview?.scale || '';
  const mainFiles = mainScale.match(/([\d,]+)\s*개\s*파일/)?.[1];
  const fileCount = detail ? formatCount(scale?.mainCodeFiles, '개') : mainFiles ? mainFiles + '개' : fallback;
  const stackCount = formatCount(detail ? detail.projectOverview?.techStack?.length : main?.projectInfo?.techStack?.length, '개');
  const date = report?.createdAt || createdAt;
  const parsedDate = date ? new Date(date) : undefined;
  const dateLabel = parsedDate && !Number.isNaN(parsedDate.getTime())
    ? parsedDate.getFullYear() + '. ' + String(parsedDate.getMonth() + 1).padStart(2, '0') + '. ' + String(parsedDate.getDate()).padStart(2, '0') : undefined;
  const sourceSummary = description?.trim() || main?.overview?.summary?.trim() || detail?.projectOverview?.purpose?.trim() || '프로젝트의 분석 결과를 확인해 보세요.';
  const summary = sourceSummary.replace(/^(?:본|이)\s*프로젝트는\s*/, '').replace(/^개발자\s+[^\s]+의\s*/, '').replace(/`([^`]+)`/g, '$1');

  return <article className="report-editorial-card">
    <div className="report-folder-paper" aria-hidden="true"><span/><span/></div>
    <svg className="report-folder-shell" viewBox="0 0 320 300" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--folder-top)"/><stop offset="0.48" stopColor="var(--folder-middle)"/><stop offset="1" stopColor="var(--folder-bottom)"/></linearGradient>
      </defs>
      <path d="M11 1H93Q101 1 105 8L115 21Q117 25 124 25H309Q319 25 319 35V289Q319 299 309 299H11Q1 299 1 289V11Q1 1 11 1Z" fill={`url(#${gradientId})`} stroke="var(--folder-border)" strokeWidth="1"/>
      <path d="M12 2H93Q100 2 104 9L114 22Q117 26 124 26H307" fill="none" stroke="var(--folder-edge)" strokeWidth="1"/>
    </svg>
    <Link className="report-card-link" to={`/report/detail/${gitRepoId}?type=${label}`} title={summary} aria-label={`${title} ${isMain ? '메인' : '상세'} 리포트 보기`} />
    <div className="report-card-heading">
      <span className="report-type-label">{isMain ? '메인 리포트' : '상세 리포트'}</span>

    </div>
    <div className="report-card-intro">
      <h2 title={main?.projectInfo?.projectName?.split('/').pop() || title}>{main?.projectInfo?.projectName?.split('/').pop() || title}</h2>
      <h3>{isMain ? '프로젝트 종합 분석' : '기술·코드 분석'}</h3>
      <p title={sourceSummary}>{summary}</p>
    </div>
    <p className="report-folder-meta">파일 {fileCount}<span>·</span>기술 스택 {stackCount}</p>
    <div className="report-folder-bottom">{dateLabel ? <time dateTime={date}>{dateLabel}</time> : <span/>}<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg></div>
  </article>;
};

export default ReportCard;
