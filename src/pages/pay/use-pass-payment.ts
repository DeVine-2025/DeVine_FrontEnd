import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getChannelKey } from '@apis/payment/payment';
import { useCompletePayment } from '@apis/payment/payment-queries';
import { requestPayment, type PgProvider } from '@apis/payment/requestPayment';
const TICKET_PRODUCT_IDS: Record<1 | 3, number> = { 1: 4, 3: 5 };
export function usePassPayment(
  selectedUnitCount: 1 | 3,
  orderQuantity: number,
  expectedAmount: number,
) {
  const { mutateAsync: completePayment, isPending } = useCompletePayment();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [paymentError, setPaymentError] = useState<{ message: string; isCancel?: boolean } | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const handleProceedPayment = async () => {
    if (isProcessing) return;

    if (!isUserLoaded) {
      setPaymentError({ message: '사용자 정보를 확인 중입니다. 잠시 후 다시 시도해 주세요.' });
      return;
    }

    if (!user?.id) {
      setPaymentError({ message: '결제를 진행하려면 로그인이 필요합니다.' });
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const pg: PgProvider = 'TOSS_PAYMENTS';
      const { channelKey, pgProvider } = await getChannelKey(pg);

      const paymentId = `payment_${Date.now()}`;
      const orderName = `이용권 ${selectedUnitCount}개 x${orderQuantity}`;
      const items = [
        { ticketProductId: TICKET_PRODUCT_IDS[selectedUnitCount], quantity: orderQuantity },
      ];

      await requestPayment({
        channelKey,
        pgProvider,
        paymentId,
        orderName,
        totalAmount: expectedAmount,
        clerkId: user.id,
        items,
      });

      await completePayment({
        paymentId,
        orderName,
        amount: expectedAmount,
        items,
      });

      window.alert('결제가 완료되었습니다.');
      setPaymentError(null);
    } catch (err: any) {
      // PortOne V2에서 사용자 취소인 경우 (보통 code가 존재함)
      const isCancel =
        err.code === 'FAILURE_TYPE.PAYMENT_CANCELED' || err.message?.includes('취소');
      const message = isCancel
        ? '결제가 취소되었습니다.'
        : err.message || '결제 중 오류가 발생했습니다.';

      setPaymentError({
        message,
        isCancel: !!isCancel,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return { handleProceedPayment, isProcessing, isPending, paymentError };
}
