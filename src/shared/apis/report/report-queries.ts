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

export const getMemberReports = async (
  nickname: string,
  type?: 'MAIN' | 'DETAIL'
) => {
  const { data } = await axiosInstance.get(
    `/api/v1/reports/members/${nickname}`,
    {
      params: { type }, // 없으면 자동으로 query 안 붙음
    }
  );

  return data;
};


export const reportQueries = {
  report: (params?: ReportCardRequest) => ({
    queryKey: ['reports', params?.type],
    queryFn: () => getReports(params),
  }),

  getMemberReports: ({
    nickname,
    type,
  }: {
    nickname: string;
    type?: 'MAIN' | 'DETAIL';
  }) => ({
    queryKey: ['members', nickname, type],
    queryFn: () => getMemberReports(nickname, type),
  }),

  main: ({ gitRepoId, token }: ReportDetailRequest) => ({
    queryKey: ['gitRepoId/main', gitRepoId],
    queryFn: () => getReportMain(gitRepoId, token)
  }),

  detail: ({ gitRepoId, token }: ReportDetailRequest) => ({
    queryKey: ['gitRepoId/detail', gitRepoId],
    queryFn: () => getReportDetail(gitRepoId, token)
  })
};
