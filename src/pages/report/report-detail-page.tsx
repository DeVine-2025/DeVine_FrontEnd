import type { Report } from '@apis/report/report';
import { reportQueries } from '@apis/report/report-queries';
import { useAuth } from '@clerk/clerk-react';
import MainDetail from '@components/report/MainDetail';
import ReportDetail from '@components/report/ReportDetail';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

const ReportDetailPage = () => {
  const { getToken } = useAuth();
  const { reportId } = useParams();
  const [searchParams] = useSearchParams();

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
      <section className="flex w-full flex-col gap-3">
        <p className="text-center font-bold text-4xl text-ui-1000">
          {displayTitle ?? '리포트'}{' '}
          {title} 리포트
        </p>

        <p className="text-center text-lg text-ui-500">프로젝트 분석 리포트 | {title} 리포트</p>
      </section>

      {/* MAIN / DETAIL 분기 */}
      {report.reportType === 'MAIN' ? (
        <MainDetail data={content} />
      ) : (
        <ReportDetail data={content} />
      )}
    </div>
  );
};

export default ReportDetailPage;
