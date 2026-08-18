import { axiosInstance } from '@apis/instance';

export const ADMIN_PAYMENTS_QUERY_KEY = ['admin', 'payments'] as const;

export type AdminPaymentStatus = 'PAID' | 'CANCELLED' | 'CANCELED' | 'REFUNDED' | string;

export type AdminPayment = {
  paymentId: number;
  memberNickname: string;
  orderName: string;
  amount: number;
  paidAt: string;
  status: AdminPaymentStatus;
};

export type AdminPaymentPage = {
  content: AdminPayment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type GetAdminPaymentsParams = {
  memberNickname?: string;
  ticketProductId?: number;
  startDate?: string;
  endDate?: string;
  page: number;
  size: number;
};

export type RefundPaymentResult = {
  cancellationId: string;
  amount: number;
  cancelledAt: string;
  revokedCredits: number;
};

export type AdminPaymentMethod = {
  method: string | null;
  provider: string | null;
  cardName: string | null;
  cardNumber: string | null;
  cardBrand: string | null;
  approvalNumber: string | null;
  installmentMonth: number | null;
};

export type AdminPaymentTicket = {
  ticketProductId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCreditAmount: number;
  totalCredits: number;
};

export type AdminPaymentDetail = AdminPayment & {
  portonePaymentId: string;
  currency: string;
  method: AdminPaymentMethod | null;
  pgProvider: string | null;
  tickets: AdminPaymentTicket[];
  remainingReportCredits: number;
  refund: { reason: string } | null;
};

type ApiResponse<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

export async function getAdminPayments(params: GetAdminPaymentsParams): Promise<AdminPaymentPage> {
  const { data } = await axiosInstance.get<ApiResponse<AdminPaymentPage>>('/admin/v1/payments', {
    params,
  });

  return data.result;
}

export async function refundAdminPayment(
  paymentId: number,
  reason: string,
): Promise<RefundPaymentResult> {
  const { data } = await axiosInstance.post<ApiResponse<RefundPaymentResult>>(
    `/admin/v1/payments/${paymentId}/refund`,
    { reason },
  );

  return data.result;
}

export async function getAdminPaymentDetail(paymentId: number): Promise<AdminPaymentDetail> {
  const { data } = await axiosInstance.get<ApiResponse<AdminPaymentDetail>>(
    `/admin/v1/payments/${paymentId}`,
  );

  return data.result;
}
