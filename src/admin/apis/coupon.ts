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

export type CreateAdminCouponRequest = {
  name: string;
  discountType: 'FIXED_RATE' | 'FIXED_AMOUNT';
  discountValue: number;
  applicableTicketProductId: number;
  validFrom: string;
  validUntil: string;
  totalIssueLimit: number;
  description: string;
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

export async function getAdminCoupon(couponId: number) {
  const { data } = await axiosInstance.get<ApiResponse<AdminCoupon>>(
    `/admin/v1/coupon/${couponId}`,
  );

  return data.result;
}

export async function createAdminCoupon(body: CreateAdminCouponRequest) {
  const { data } = await axiosInstance.post<ApiResponse<AdminCoupon>>('/admin/v1/coupon', body);

  return data.result;
}
