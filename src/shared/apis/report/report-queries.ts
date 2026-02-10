import { axiosInstance } from '@apis/instance';
import {
  ReportCardResponse,
  ReportCardRequest,
} from '@apis/report/report';

export const getReports = async (
  params: ReportCardRequest
): Promise<ReportCardResponse> => {
  const { data } = await axiosInstance.get('/api/v1/reports/me', {
    params,
  });
  return data;
};

export const reportQueries = {
  report: (params: { type: 'MAIN' | 'DETAIL' } | undefined) => ({
    queryKey: ['reports', params?.type],
    queryFn: () => getReports(params),
  }),
};
