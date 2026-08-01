// src/shared/apis/payment/requestPayment.ts
import * as PortOne from '@portone/browser-sdk/v2';

export type PgProvider = 'NHN_KCP' | 'KG_INICIS' | 'KAKAOPAY' | 'TOSS_PAYMENTS';

interface RequestPaymentParams {
  channelKey: string;
  paymentId: string;
  orderName: string;
  totalAmount: number;
  pgProvider: PgProvider;
  clerkId: string;
  items: Array<{ ticketProductId: number; quantity: number }>;
  memberCouponId?: number;
}

export async function requestPayment(params: RequestPaymentParams) {
  const { channelKey, paymentId, orderName, totalAmount, pgProvider, clerkId, items, memberCouponId } =
    params;

  const storeId = import.meta.env.VITE_PORTONE_STORE_ID;
  if (!storeId) throw new Error('VITE_PORTONE_STORE_ID가 설정되지 않았습니다.');

  const isTossPay = pgProvider === 'TOSS_PAYMENTS';
  // 토스페이는 간편결제 수단을 직접 지정해 통합 결제창 대신 토스페이만 호출한다.
  const payMethod = pgProvider === 'KAKAOPAY' || isTossPay ? 'EASY_PAY' : 'CARD';

  const response = await PortOne.requestPayment({
    storeId,
    channelKey,
    paymentId,
    orderName,
    totalAmount,
    currency: 'CURRENCY_KRW',
    payMethod,
    customData: {
      clerkId,
      orderName,
      items,
      ...(memberCouponId !== undefined && { memberCouponId }),
    },
    ...(isTossPay && {
      easyPay: {
        easyPayProvider: 'TOSSPAY',
      },
    }),
  });

  // response.code가 있으면 결제 실패 또는 사용자 취소
  if (response?.code !== undefined) {
    const error = new Error(response.message ?? '결제에 실패했습니다.');
    (error as any).code = response.code;
    throw error;
  }

  return response;
}
