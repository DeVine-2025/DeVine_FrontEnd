// src/shared/apis/payment/requestPayment.ts
import * as PortOne from '@portone/browser-sdk/v2';

export type PgProvider = 'NHN_KCP' | 'KG_INICIS' | 'KAKAOPAY';

interface RequestPaymentParams {
  channelKey: string;
  paymentId: string;
  orderName: string;
  totalAmount: number;
  pgProvider: PgProvider;
}

export async function requestPayment(params: RequestPaymentParams) {
  const { channelKey, paymentId, orderName, totalAmount, pgProvider } = params;

  const storeId = import.meta.env.VITE_PORTONE_STORE_ID;
  if (!storeId) throw new Error('VITE_PORTONE_STORE_ID가 설정되지 않았습니다.');

  // KAKAOPAY는 간편결제(EASY_PAY), 나머지는 카드(CARD)
  const payMethod = pgProvider === 'KAKAOPAY' ? 'EASY_PAY' : 'CARD';

  const response = await PortOne.requestPayment({
    storeId,
    channelKey,
    paymentId,
    orderName,
    totalAmount,
    currency: 'CURRENCY_KRW',
    payMethod,
  });

  // response.code가 있으면 결제 실패 또는 사용자 취소
  if (response?.code !== undefined) {
    throw new Error(response.message ?? '결제에 실패했습니다.');
  }

  return response;
}