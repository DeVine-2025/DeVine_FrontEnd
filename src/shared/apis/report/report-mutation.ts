import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReportSync } from '@apis/reports';
import { ReportDetailRequest, ReportPatchVisibilityRequest } from '@apis/report/report';
import { axiosInstance } from '@apis/instance';


export const patchReportVisibility = async ({ reportId, visibility }: ReportPatchVisibilityRequest) => {
  const { data } = await axiosInstance.patch(`/api/v1/reports/${reportId}/visibility`, {
    visibility,
  });
  return data;
}

export const useCreateReportMutation = () => {
  return useMutation({
    mutationFn: ({ gitRepoId, token }: ReportDetailRequest & { token: string }) =>
      createReportSync(gitRepoId, token),
  });
};

export const usePatchReportVisibility = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reportId, visibility }: ReportPatchVisibilityRequest) =>
      patchReportVisibility({ reportId, visibility }),
    onSuccess: () => {
      // 리포트 목록 쿼리 캐시 무효화하여 최신 데이터로 갱신
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};
