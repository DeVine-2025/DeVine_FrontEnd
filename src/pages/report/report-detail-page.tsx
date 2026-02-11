import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, QueryFunction } from '@tanstack/react-query';
import { reportQueries } from '@apis/report/report-queries';
import { useAuth } from '@clerk/clerk-react';

import { Report } from '@apis/report/report';

import ReportDetail from '@components/report/ReportDetail';
import MainDetail from '@components/report/MainDetail';

const ReportDetailPage = () => {
  const { getToken } = useAuth();
  const { reportId } = useParams();
  const [searchParams] = useSearchParams();

  const type = searchParams.get('type');
  const gitRepoId = Number(reportId);
  const title = type === 'MAIN' ? '메인' : '상세';

  const fetchReport: QueryFunction<Report> = async () => {
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

  const { data: report, isLoading, isError } = useQuery<Report, Error>({
    queryKey: ['report-detail', gitRepoId, type],
    queryFn: fetchReport,
    enabled: !!gitRepoId && !!type,
  });

  if (isLoading) return null;
  if (isError || !report) return null;

  return (
    <div className="w-full max-w-[900px] mx-auto flex flex-col gap-10">
      {/* 제목 */}
      <section className="w-full flex flex-col gap-3">
        <p className="text-ui-1000 text-4xl font-bold text-center">
          {report.reportType === 'MAIN'
            ? report.content.projectInfo.projectName
            : report.content.reportTitle}{' '}
          {title} 리포트
        </p>

        <p className="text-ui-500 text-lg text-center">
          프로젝트 분석 리포트 | {title} 리포트
        </p>
      </section>

      {/* MAIN / DETAIL 분기 */}
      {report.reportType === 'MAIN' ? (
        <MainDetail data={report.content} />
      ) : (
        <ReportDetail data={report.content} />
      )}
    </div>
  );
};

export default ReportDetailPage;
