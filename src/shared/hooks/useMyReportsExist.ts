import { getMyReportsMe } from '@apis/reports';
import { useAuth } from '@clerk/clerk-react';
import type { ReportType } from '@t/report';
import { useQuery } from '@tanstack/react-query';

export function useMyReportsExist(type?: ReportType) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['myReportsExist', type],
    queryFn: async () => {
      const token = await getToken();
      if (!token) return false;

      const reports = await getMyReportsMe(token, type);
      return reports.length > 0;
    },
    staleTime: 30_000,
  });
}
