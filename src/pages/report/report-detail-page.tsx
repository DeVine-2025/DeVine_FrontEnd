import type { Report, ReportDetailContent, ReportMainContent } from '@apis/report/report';
import { reportQueries } from '@apis/report/report-queries';
import { useAuth } from '@clerk/clerk-react';
import MainDetail from './_components/MainDetail';
import ReportDetail from './_components/ReportDetail';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useParams, useSearchParams } from 'react-router-dom';
import PdfIcon from '@assets/icons/create-project/pdf.svg?react';

const ReportDetailPage = () => {
  const { getToken } = useAuth();
  const { reportId } = useParams();
  const [searchParams] = useSearchParams();
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
  const title = type === 'MAIN' ? '메인' : '상세';

  const fetchReport = async (): Promise<Report> => {
    const token = await getToken();
    if (!token) throw new Error('No token');

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
    data: report,
    isLoading,
    isError,
  } = useQuery<Report, Error>({
    queryKey: ['report-detail', gitRepoId, type],
    queryFn: fetchReport,
    enabled: !!gitRepoId && !!type,
  });

  if (isLoading) return null;
  if (isError || !report) return null;

  const content = report?.content;
  if (!content) return null;

  const displayTitle =
    report.reportType === 'MAIN'
      ? (content as { projectInfo?: { projectName?: string } })?.projectInfo?.projectName
      : (content as { reportTitle?: string })?.reportTitle;

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-10">
      {/* 제목 */}
      <section className="relative flex flex-col gap-3">
        <button
          type="button"
          onClick={() => handlePrint()}
          title="인쇄 창에서 '머리글 및 바닥글' 옵션을 끄면 날짜, URL이 출력되지 않습니다."
          className="group absolute right-0 top-[70px] flex h-12 w-[150px] items-center justify-center gap-3 rounded-lg bg-[var(--ui-50)] text-ui-600 transition-[color,opacity] hover:opacity-90"
        >
          <PdfIcon className="h-6 w-5 shrink-0 [&_path]:stroke-[var(--ui-500)] group-hover:[&_path]:stroke-[var(--ui-1000)]" />
          <span className="text-base font-medium transition-colors group-hover:font-semibold group-hover:text-ui-1000">PDF로 출력하기</span>
        </button>
        <div
          ref={printRef}
          className={`report-print-content report-print-${report.reportType === 'MAIN' ? 'main' : 'detail'} flex flex-col gap-10`}
          style={{ overflow: 'visible' }}
        >
          <div className="mb-20 flex flex-col gap-3">
            <p className="text-center font-bold text-4xl text-ui-1000">
              {displayTitle ?? '리포트'}{' '}
              {title} 리포트
            </p>
            <p className="text-center text-lg text-ui-500">
              프로젝트 분석 리포트 | {title} 리포트
            </p>
          </div>
          <hr className="border-ui-200 py-[0.6rem]"/>
          {report.reportType === 'MAIN' ? (
            <MainDetail data={content as unknown as ReportMainContent} />
          ) : (
            <ReportDetail data={content as unknown as ReportDetailContent} />
          )}
        </div>
        <hr className="border-ui-300"/>
        <p className="pt-[3.3rem] text-center text-ui-400">본 리포트는 Devine의 AI 코드 분석 시스템이 생성했습니다.<br/>
          상세한 분석 내용은 상세 리포트를 확인하세요.</p>
      </section>
    </div>
  );
};

export default ReportDetailPage;
