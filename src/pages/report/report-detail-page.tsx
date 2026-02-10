import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { reportQueries } from '@apis/report/report-queries';
import { useAuth } from '@clerk/clerk-react';
const ReportDetailPage = () => {
  const { getToken } = useAuth();
  const { reportId } = useParams();
  const [searchParams] = useSearchParams();

  const type = searchParams.get('type'); // 'MAIN' | 'DETAIL'
  const gitRepoId = Number(reportId);

  const { data } = useQuery({
    queryKey: ['report-detail', gitRepoId, type],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');

      if (type === 'MAIN') {
        return reportQueries.main({
          gitRepoId,
          token,
        }).queryFn();
      }

      return reportQueries.detail({
        gitRepoId,
        token,
      }).queryFn();
    },
    enabled: !!gitRepoId && !!type,
  });

  console.log(data);

  return (
    <div>
      
    </div>
  );
};

export default ReportDetailPage;