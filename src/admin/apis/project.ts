import { axiosInstance } from '@apis/instance';

export const ADMIN_PROJECTS_QUERY_KEY = ['admin', 'projects'] as const;

export type AdminProject = {
  projectId: number;
  title: string;
  authorNickname: string;
  createdAt: string;
  visible: boolean;
};

export type AdminProjectPage = {
  content: AdminProject[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type UpdateProjectVisibilityResult = {
  reportId: number;
  visibility: 'PUBLIC' | 'PRIVATE';
};

type ApiResponse<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

type GetAdminProjectsParams = {
  page: number;
  size: number;
  visible?: boolean;
};

export async function getAdminProjects({
  page,
  size,
  visible,
}: GetAdminProjectsParams): Promise<AdminProjectPage> {
  const { data } = await axiosInstance.get<ApiResponse<AdminProjectPage>>('/admin/v1/projects', {
    params: {
      page,
      size,
      ...(visible === undefined ? {} : { visible }),
    },
  });

  return data.result;
}

export async function updateProjectVisibility(
  projectId: number,
  visible: boolean,
): Promise<UpdateProjectVisibilityResult> {
  const { data } = await axiosInstance.patch<ApiResponse<UpdateProjectVisibilityResult>>(
    `/admin/v1/projects/${projectId}/visibility`,
    { visible },
  );

  return data.result;
}
