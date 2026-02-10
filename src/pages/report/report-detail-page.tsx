import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { reportQueries } from '@apis/report/report-queries';
import { useAuth } from '@clerk/clerk-react';
const ReportDetailPage = () => {
  const { getToken } = useAuth();
  const { reportId } = useParams();
  const [searchParams] = useSearchParams();

  const type = searchParams.get('type'); // 'MAIN' or 'DETAIL'

  const reportIdNum = Number(reportId);

  const { data } = useQuery(
    type === 'MAIN'
      ? reportQueries.main({
        reportId: reportIdNum,
        getToken,
      })
      : reportQueries.detail({
        reportId: reportIdNum,
        getToken,
      })
  );

  console.log(data);

  return (
    <div>
      
    </div>
  );
};

export default ReportDetailPage;