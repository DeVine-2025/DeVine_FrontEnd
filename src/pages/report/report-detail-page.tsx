import type { Report, ReportDetailContent, ReportMainContent } from '@apis/report/report';
import { reportQueries } from '@apis/report/report-queries';
import { useElasticUnderline } from '@hooks/useElasticUnderline';
import { useAuth } from '@clerk/clerk-react';
import MainDetail from '@components/report/MainDetail';
import { ReportWorkspaceLoading } from '@components/common/LoadingLayouts';
import ReportDetail from '@components/report/ReportDetail';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { sampleMainReport, sampleDetailReport } from './report-sample-data';
import { useMockData } from '../../shared/config/data-mode';

const ReportDetailPage = () => {
  const { getToken } = useAuth();
  const { reportId } = useParams();
  const location = useLocation();
  const fromFolder = Boolean((location.state as { fromReportFolder?: boolean } | null)?.fromReportFolder);
  const [searchParams, setSearchParams] = useSearchParams();
  const { navRef, indicatorRef } = useElasticUnderline(searchParams.get('type') || '');
  const isSamplePreview = useMockData && searchParams.get('preview') === 'sample';
  const isSample = isSamplePreview && searchParams.get('type') === 'MAIN';
  const isSampleDetail = isSamplePreview && searchParams.get('type') === 'DETAIL';
  const selectType = (nextType: 'MAIN' | 'DETAIL') => { const next = new URLSearchParams(searchParams); next.set('type', nextType); setSearchParams(next); };
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: `
      @page { size: A4; margin: 15mm; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      html, body { overflow: visible !important; height: auto !important; max-height: none !important; background: #ffffff !important; color: #1a1a1a !important; --ui-bg: #ffffff !important; --ui-50: #f5f5f5 !important; --ui-100: #eeeeee !important; --ui-200: #e0e0e0 !important; --ui-300: #9e9e9e !important; --ui-400: #616161 !important; --ui-500: #424242 !important; --ui-600: #303030 !important; --ui-700: #212121 !important; --ui-800: #1a1a1a !important; --ui-900: #141414 !important; --ui-1000: #000000 !important; }
      body * { overflow: visible !important; }
      .report-print-content { background: #ffffff !important; color: #1a1a1a !important; }
      .report-print-content * { color: #1a1a1a !important; }
      .report-print-content .report-print-block, .report-print-content .rounded-3xl { background-color: #f5f5f5 !important; }
      .report-print-content .from-indigo-600 { background: #e8e4ff !important; }
      .report-print-content hr, .report-print-content [class*="border"] { border-color: #e0e0e0 !important; }
      .report-print-content svg { fill: #1a1a1a !important; }
      .report-print-content .report-print-block { break-inside: avoid; }
      .report-print-content section { break-inside: avoid; }
      .report-print-main .report-print-section { break-before: page; break-inside: avoid; }
      .report-print-main .report-print-main-first { break-before: auto; }
      .report-print-main .report-print-main-last { gap: 2rem !important; }
      .report-print-detail .report-print-section { break-before: page; break-inside: avoid; }
      .report-print-detail .report-print-section:first-of-type { break-before: auto; }
      .report-print-detail .report-print-same-page { gap: 2rem !important; }
      .report-print-detail .report-print-compact { gap: 0.5rem !important; }
      .report-print-detail .report-print-compact .report-print-compact-inner,
      .report-print-detail .report-print-compact .rounded-3xl { padding: 0.8rem 1.2rem !important; }
      .report-print-detail .report-print-compact .flex-col.gap-10 { gap: 0.3rem !important; }
      .report-print-detail .report-print-compact .text-xl { font-size: 1rem !important; }
      .report-print-detail .report-print-implement .report-print-implement-inner { padding: 0.8rem 1.2rem !important; }
      .report-print-detail .report-print-implement .flex-col.gap-13 { gap: 0.8rem !important; }
      .report-print-detail .report-print-implement .report-print-block { gap: 0.5rem !important; }
      .report-print-detail .report-print-implement .rounded-3xl { padding: 0.6rem 1rem !important; }
      .report-print-detail .report-print-implement .text-xl { font-size: 1rem !important; }
      .report-print-detail .report-print-implement .text-lg { font-size: 0.9rem !important; }
    `,
  });

  const type = searchParams.get('type');
  const gitRepoId = Number(reportId);
  const fetchReport = async (): Promise<Report> => {
    const token = (await getToken()) ?? undefined;

    if (type === 'MAIN') {
      const res = await reportQueries.main({ gitRepoId, token }).queryFn();
      if (!res) throw new Error('MAIN report not found');
      return res;
    }

    const res = await reportQueries.detail({ gitRepoId, token }).queryFn();
    if (!res) throw new Error('DETAIL report not found');
    return res;
  };

  const {
    data: apiReport,
    isLoading,
    isError,
  } = useQuery<Report, Error>({
    queryKey: ['report-detail', gitRepoId, type],
    queryFn: fetchReport,
    enabled: !!gitRepoId && !!type && !isSample && !isSampleDetail,
  });
  const report = isSample ? sampleMainReport : isSampleDetail ? sampleDetailReport : apiReport;
  const otherType = type === 'MAIN' ? 'DETAIL' : 'MAIN';
  const otherReport = useQuery({
    queryKey: ['report-detail', gitRepoId, otherType],
    queryFn: async () => {
      const token = (await getToken()) ?? undefined;
      return otherType === 'MAIN' ? reportQueries.main({ gitRepoId, token }).queryFn() : reportQueries.detail({ gitRepoId, token }).queryFn();
    },
    enabled: !!gitRepoId && (type === 'MAIN' || type === 'DETAIL') && !isSamplePreview,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const otherMissing = !isSamplePreview && ((otherReport.isSuccess && !otherReport.data) || (otherReport.isError && /: 404$/.test(otherReport.error.message)));
  const reportTabs = <nav ref={navRef} className="report-type-tabs" aria-label="리포트 종류">{(['MAIN', 'DETAIL'] as const).map(tabType => <button key={tabType} type="button" aria-current={type === tabType ? 'page' : undefined} disabled={tabType === otherType && otherMissing} title={tabType === otherType && otherMissing ? '아직 생성되지 않은 리포트입니다' : undefined} onClick={() => selectType(tabType)}>{tabType === 'MAIN' ? '메인 리포트' : '상세 리포트'}</button>)}<span ref={indicatorRef} className="report-type-indicator" aria-hidden="true" /></nav>;



  return <div className={`rw-full-page ${fromFolder ? 'report-folder-arrival' : ''}`}>
    {reportTabs}
    {!isSamplePreview && isLoading ? <ReportWorkspaceLoading /> :
      ((!isSamplePreview && isError) || !report) ? <div className="report-type-message" role="alert">리포트를 불러오지 못했어요. 리포트가 생성되었는지 확인하거나 잠시 후 다시 시도해 주세요.{import.meta.env.DEV && <button className="rw-preview-link" onClick={() => setSearchParams({ type: 'MAIN', preview: 'sample' })}>샘플 리포트 보기</button>}</div> :
      report.reportType === 'MAIN' ? <>
        <div ref={printRef} className="report-print-content report-print-main"><MainDetail data={report.content as ReportMainContent} onPrint={handlePrint} repoUrl={report.gitRepoUrl} /></div>
      </> : <>
        <div ref={printRef} className="report-print-content report-print-detail"><ReportDetail data={report.content as ReportDetailContent} onPrint={handlePrint} repoUrl={report.gitRepoUrl}/></div>
      </>}
  </div>;
};

export default ReportDetailPage;
