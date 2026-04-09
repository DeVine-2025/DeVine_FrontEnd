import { axiosInstance } from '@apis/instance';
import type { ApiResponse } from '@apis/base/api';
import type { PgProvider } from './requestPayment';

export interface ChannelKeyResult {
  pgProvider: PgProvider;
  channelKey: string;
}

export interface PaymentCompleteRequest {
  paymentId: string;
  orderName: string;
  amount: number;
  items: Array<{ ticketProductId: number; quantity: number }>;
}

export interface MyCreditsResult {
  remainingCount: number;
}

export async function getChannelKey(pg: PgProvider) {
  const { data } = await axiosInstance.get<ApiResponse<ChannelKeyResult>>(
    '/api/v1/payments/channel-key',
    { params: { pg } },
  );
  return data.result;
}

export async function completePayment(body: PaymentCompleteRequest) {
  const { data } = await axiosInstance.post<ApiResponse<unknown>>('/api/v1/payments/complete', body);
  return data.result;
}

export async function getMyCredits() {
  const { data } = await axiosInstance.get<ApiResponse<MyCreditsResult>>('/api/v1/tickets/my-credits');
  return data.result;
}
