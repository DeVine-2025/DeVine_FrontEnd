import { axiosInstance } from '@apis/instance';
import { ReportCardResponse } from '@apis/report/report';

export const getReports = async (): Promise<ReportCardResponse> => {
  const { data } = await axiosInstance.get('/reports');
  return data;
};

export const reportQueries = {
  report: () => ({
    queryKey: ['reports'],
    queryFn: getReports,
  }),
};