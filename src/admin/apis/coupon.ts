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
  totalIssueLimit: number | null;
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

export type UpdateAdminCouponRequest = {
  name?: string | null;
  validFrom?: string | null;
  validUntil?: string | null;
  totalIssueLimit?: number | null;
  clearTotalIssueLimit?: boolean;
  isActive?: boolean | null;
  description?: string | null;
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

export async function updateAdminCoupon(couponId: number, body: UpdateAdminCouponRequest) {
  const { data } = await axiosInstance.patch<ApiResponse<AdminCoupon>>(
    `/admin/v1/coupon/${couponId}`,
    body,
  );

  return data.result;
}
