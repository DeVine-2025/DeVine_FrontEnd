import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { reportQueries } from '@apis/report/report-queries';
import { useAuth } from '@clerk/clerk-react';
const ReportDetailPage = () => {
  const {getToken} = useAuth();
  const { reportId } = useParams();

  const [searchParams] = useSearchParams();

  const type = searchParams.get('type'); // 'main' or 'detail'

  const {data} = useQuery(type === "MAIN" ? reportQueries.main(reportId, getToken) : reportQueries.detail(reportId, getToken));


  console.log(data);
  console.log(reportId, type);

  return (
    <div>
      
    </div>
  );
};

export default ReportDetailPage;