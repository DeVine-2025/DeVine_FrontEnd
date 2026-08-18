import type { ApiResponse } from '@apis/base/api';
import { axiosInstance } from '@apis/instance';

export type AdminNoticeListItem = {
  noticeId: number;
  title: string;
  content: string;
  displayStartAt: string | null;
  displayEndAt: string | null;
  isExposed: boolean;
  displayStatus: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminNoticePage = {
  content: AdminNoticeListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type CreateAdminNoticeRequest = {
  title: string;
  content: string;
  displayStartAt?: string;
  displayEndAt?: string;
  isExposed: boolean;
};

type GetAdminNoticesParams = {
  page: number;
  size: number;
};

export async function getAdminNotices(params: GetAdminNoticesParams) {
  const { data } = await axiosInstance.get<ApiResponse<AdminNoticePage>>('/admin/v1/notices', {
    params,
  });

  return data.result;
}

export async function getAdminNotice(noticeId: number) {
  const { data } = await axiosInstance.get<ApiResponse<AdminNoticeListItem>>(
    `/admin/v1/notices/${noticeId}`,
  );

  return data.result;
}

export async function createAdminNotice(body: CreateAdminNoticeRequest) {
  const { data } = await axiosInstance.post<ApiResponse<AdminNoticeListItem>>(
    '/admin/v1/notices',
    body,
  );

  return data.result;
}
