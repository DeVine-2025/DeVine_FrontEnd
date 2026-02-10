import { useMutation } from '@tanstack/react-query';
import { createReportSync } from '@apis/reports';
import { ReportDetailRequest } from '@apis/report/report';

export const useCreateReportMutation = () => {
  return useMutation({
    mutationFn: ({ gitRepoId, token }: ReportDetailRequest) =>
      createReportSync(gitRepoId, token),
  });
};
