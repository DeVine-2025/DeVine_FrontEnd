import type { ApiResponse } from '@apis/base/api';
import { axiosInstance } from '@apis/instance';

export type AdminMemberListItem = {
  name: string | null;
  nickname: string;
  email: string | null;
  status: string;
  createdAt: string;
};

export type AdminMemberPage = {
  content: AdminMemberListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

type GetAdminMembersParams = {
  keyword?: string;
  page: number;
  size: number;
};

export async function getAdminMembers({ keyword, page, size }: GetAdminMembersParams) {
  const { data } = await axiosInstance.get<ApiResponse<AdminMemberPage>>('/admin/v1/member', {
    params: {
      ...(keyword ? { keyword } : {}),
      page,
      size,
    },
  });

  return data.result;
}
