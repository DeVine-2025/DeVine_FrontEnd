import { axiosInstance } from '@apis/instance';
import {
  ReportCardResponse,
  ReportCardRequest,
  ReportDetailRequest,
} from '@apis/report/report';
import { getReportMain, getReportDetail } from '@apis/reports';

export const getReports = async (
  params?: ReportCardRequest
): Promise<ReportCardResponse> => {
  const { data } = await axiosInstance.get('/api/v1/reports/me', {
    params,
  });
  return data;
};

export const reportQueries = {
  report: (params?: ReportCardRequest) => ({
    queryKey: ['reports', params?.type],
    queryFn: () => getReports(params),
  }),

  main: ({ gitRepoId, token }: ReportDetailRequest) => ({
   queryKey: ['gitRepoId/main', gitRepoId],
   queryFn: () =>  getReportMain(gitRepoId, token)
  }),

  detail: ({ gitRepoId, token }: ReportDetailRequest) => ({
    queryKey: ['gitRepoId/detail', gitRepoId],
    queryFn: () =>  getReportDetail(gitRepoId, token)
  })
};
