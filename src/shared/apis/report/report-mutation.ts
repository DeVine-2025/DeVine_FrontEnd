import { useMutation } from '@tanstack/react-query';
import { createReportSync } from '@apis/reports';
import { ReportDetailRequest, ReportPatchVisibilityRequest } from '@apis/report/report';
import { axiosInstance } from '@apis/instance';


export const patchReportVisibility = async ({ reportId } : ReportPatchVisibilityRequest) => {
  const {data} = await axiosInstance.patch(`/api/v1/reports/${reportId}/visibility`);
  return data;
}

export const useCreateReportMutation = () => {
  return useMutation({
    mutationFn: ({ gitRepoId, token }: ReportDetailRequest) =>
      createReportSync(gitRepoId, token),
  });
};

export const usePatchReportVisibility = () => {
  return useMutation({
    mutationFn: ({ reportId }: ReportPatchVisibilityRequest) =>
      patchReportVisibility(reportId)
  })
}
