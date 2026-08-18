import type { ApiResponse } from '@apis/base/api';
import { axiosInstance } from '@apis/instance';

export type AdminProjectListItem = {
  projectId: number;
  title: string;
  authorNickname: string;
  createdAt: string;
  visible: boolean;
};

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

export async function getAdminProjects(params: GetAdminProjectsParams) {
  const { data } = await axiosInstance.get<ApiResponse<AdminProjectPage>>('/admin/v1/projects', {
    params,
  });

  return data.result;
}
