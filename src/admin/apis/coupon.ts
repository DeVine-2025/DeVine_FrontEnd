import { axiosInstance } from '@apis/instance';
import type { ApiResponse } from '@apis/base/api';

export type AdminCouponCode = {
  code: string;
  maxUses: number;
  usedCount: number;
};

export type AdminCouponDiscountType = 'FIXED_RATE' | 'FIXED_AMOUNT';

export type AdminCoupon = {
  couponId: number;
  name: string;
  discountType: AdminCouponDiscountType;
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
  discountType: AdminCouponDiscountType;
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

export type AdminCouponUsage = {
  couponId: number;
  name: string;
  issuedCount: number;
  usedCount: number;
  usageRate: number;
  isExpiringSoon: boolean;
  validUntil: string;
};

export type IssueAdminCouponRequest = {
  issueType: 'ALL' | 'SPECIFIC' | 'CODE_GEN';
  nicknames?: string[];
  codeLength?: number;
  codeCount?: number;
  code?: string;
  maxUses?: number;
};

export type IssueAdminCouponResult = {
  issuedCount?: number | null;
  generatedCodes?: string[] | null;
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

export async function getAdminCouponUsage(couponId?: number) {
  const { data } = await axiosInstance.get<ApiResponse<AdminCouponUsage[]>>(
    '/admin/v1/coupon/usage',
    { params: couponId ? { couponId } : undefined },
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

export async function issueAdminCoupon(couponId: number, body: IssueAdminCouponRequest) {
  const { data } = await axiosInstance.post<ApiResponse<IssueAdminCouponResult>>(
    `/admin/v1/coupon/${couponId}/issue`,
    body,
  );

  return data.result;
}
