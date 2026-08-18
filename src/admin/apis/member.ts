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

export type AdminMemberPaymentSummary = {
  paymentId?: number | null;
  memberNickname?: string | null;
  orderName?: string | null;
  amount?: number | null;
  paidAt?: string | null;
  status?: string | null;
};

export type AdminMemberDetail = {
  name: string | null;
  nickname: string;
  email: string | null;
  mainType: string | null;
  status: string;
  scheduledWithdrawalAt: string | null;
  createdAt: string;
  paymentSummary: AdminMemberPaymentSummary | null;
  loginHistory?: Array<{ loginAt?: string | null }> | null;
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

export async function getAdminMemberDetail(nickname: string) {
  const { data } = await axiosInstance.get<ApiResponse<AdminMemberDetail>>(
    `/admin/v1/member/${encodeURIComponent(nickname)}`,
  );

  return data.result;
}
