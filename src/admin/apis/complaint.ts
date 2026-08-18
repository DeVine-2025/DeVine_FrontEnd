import type { ApiResponse } from '@apis/base/api';
import { axiosInstance } from '@apis/instance';

export type ComplaintTargetType = 'CHAT' | 'PROJECT' | 'DEVELOPER';
export type ComplaintStatus = 'PENDING' | 'IN_REVIEW' | 'COMPLETED';

export type AdminComplaintListItem = {
  complaintId: number;
  targetType: ComplaintTargetType;
  complainantNickname: string;
  respondentNickname: string;
  createdAt: string;
  status: ComplaintStatus;
  slaExceeded: boolean;
};

export type AdminComplaintPage = {
  content: AdminComplaintListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

type GetAdminComplaintsParams = {
  targetType?: ComplaintTargetType;
  status?: ComplaintStatus;
  fromDate?: string;
  toDate?: string;
  page: number;
  size: number;
};

export async function getAdminComplaints(params: GetAdminComplaintsParams) {
  const { data } = await axiosInstance.get<ApiResponse<AdminComplaintPage>>(
    '/admin/v1/complaints',
    { params },
  );

  return data.result;
}
