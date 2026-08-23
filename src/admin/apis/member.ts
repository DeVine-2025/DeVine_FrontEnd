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

export type AdminMemberStatusAction =
  | 'SUSPEND'
  | 'UNSUSPEND'
  | 'FORCE_WITHDRAW'
  | 'CANCEL_WITHDRAWAL';

export type UpdateAdminMemberStatusRequest = {
  action: AdminMemberStatusAction;
  reason?: string;
  notifyRequested?: boolean;
};

export type AdminMemberStatusResult = {
  nickname: string;
  status: string;
  scheduledWithdrawalAt: string | null;
};

export async function updateAdminMemberStatus(
  nickname: string,
  body: UpdateAdminMemberStatusRequest,
) {
  const { data } = await axiosInstance.patch<ApiResponse<AdminMemberStatusResult>>(
    `/admin/v1/member/${encodeURIComponent(nickname)}/status`,
    body,
  );

  return data.result;
}
