import { axiosInstance } from '@apis/instance';
import {
  ReportCardResponse,
  ReportCardRequest,
} from '@apis/report/report';
import { getReportMain, getReportDetail } from '@apis/reports';

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

  main: (params: { gitRepoId: number, token: string}) => ({
   queryKey: ['gitRepoId/main', params?.gitRepoId],
   queryFn: () =>  getReportMain(params)
  }),

  detail: (params: { gitRepoId: number, token: string }) => ({
    queryKey: ['gitRepoId/detail', params?.gitRepoId],
    queryFn: () =>  getReportDetail(params)
  })
};
