import type { ApiResponse } from '@apis/base/api';
import { axiosInstance } from '@apis/instance';

export const ADMIN_PROJECTS_QUERY_KEY = ['admin', 'projects'] as const;

export type AdminProjectListItem = {
  projectId: number;
  title: string;
  authorNickname: string;
  createdAt: string;
  visible: boolean;
};

export type AdminProject = AdminProjectListItem;

export type AdminProjectPage = {
  content: AdminProjectListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

type GetAdminProjectsParams = {
  visible?: boolean;
  page: number;
  size: number;
};

export async function getAdminProjects({ page, size, visible }: GetAdminProjectsParams) {
  const { data } = await axiosInstance.get<ApiResponse<AdminProjectPage>>('/admin/v1/projects', {
    params: {
      page,
      size,
      ...(visible === undefined ? {} : { visible }),
    },
  });

  return data.result;
}

export type UpdateAdminProjectVisibilityRequest = {
  visible: boolean;
};

export type AdminProjectVisibilityResult = {
  projectId: number;
  visible: boolean;
  changed: boolean;
  processorMemberId: number | null;
  changedAt: string;
};

export async function updateAdminProjectVisibility(
  projectId: number,
  body: UpdateAdminProjectVisibilityRequest,
) {
  const { data } = await axiosInstance.patch<ApiResponse<AdminProjectVisibilityResult>>(
    `/admin/v1/projects/${projectId}/visibility`,
    body,
  );

  return data.result;
}

export async function updateProjectVisibility(projectId: number, visible: boolean) {
  return updateAdminProjectVisibility(projectId, { visible });
}
