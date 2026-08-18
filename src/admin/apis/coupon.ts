import { axiosInstance } from '@apis/instance';
import type { ApiResponse } from '@apis/base/api';

export type AdminCouponCode = {
  code: string;
  maxUses: number;
  usedCount: number;
};

export type AdminCoupon = {
  couponId: number;
  name: string;
  discountType: string;
  discountValue: number;
  applicableTicketProductId: number | null;
  applicableTicketProductName: string | null;
  totalIssueLimit: number;
  issuedCount: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  description: string;
  createdAt: string;
  codes: AdminCouponCode[];
};

type PageMetadata = {
  totalPages?: number;
};

export type AdminCouponPage = {
  content: AdminCoupon[];
  page?: PageMetadata;
  totalPages?: number;
};

type GetAdminCouponsParams = {
  page: number;
  size: number;
};

export async function getAdminCoupons({ page, size }: GetAdminCouponsParams) {
  const { data } = await axiosInstance.get<ApiResponse<AdminCouponPage>>('/admin/v1/coupon', {
    params: { page, size },
  });

  return data.result;
}
