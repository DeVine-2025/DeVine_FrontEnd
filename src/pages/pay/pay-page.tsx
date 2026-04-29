import { useMemo, useState } from 'react';
import { getChannelKey } from '@apis/payment/payment';
import { useCompletePayment } from '@apis/payment/payment-queries';
import { requestPayment, type PgProvider } from '@apis/payment/requestPayment';
import PassProductButton from './components/PassProductButton';
import QuantityStepper from './components/QuantityStepper';

const formatWon = (value: number) => `${Math.max(0, value).toLocaleString('ko-KR')}원`;
const getPassUnitPrice = (unitCount: 1 | 3) => (unitCount === 1 ? 4900 : 9900);
const MIN_PASS_ORDER_QUANTITY = 1;
const MAX_PASS_ORDER_QUANTITY = 99;
const TICKET_PRODUCT_IDS: Record<1 | 3, number> = {
  1: 4,
  3: 5,
};

const PayPage = () => {
  const { mutateAsync: completePayment, isPending } = useCompletePayment();

  const [selectedUnitCount, setSelectedUnitCount] = useState<1 | 3>(1);
  const [orderQuantity, setOrderQuantity] = useState<number>(MIN_PASS_ORDER_QUANTITY);
  const [paymentError, setPaymentError] = useState<{ message: string; isCancel?: boolean } | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedUnitPrice = useMemo(() => getPassUnitPrice(selectedUnitCount), [selectedUnitCount]);
  const expectedAmount = selectedUnitPrice * orderQuantity;

  const handleProceedPayment = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const pg: PgProvider = 'NHN_KCP';
      const { channelKey, pgProvider } = await getChannelKey(pg);

      const paymentId = `payment_${Date.now()}`;
      const orderName = `이용권 ${selectedUnitCount}개 x${orderQuantity}`;

      await requestPayment({
        channelKey,
        pgProvider,
        paymentId,
        orderName,
        totalAmount: expectedAmount,
      });

      await completePayment({
        paymentId,
        orderName,
        amount: expectedAmount,
        items: [{ ticketProductId: TICKET_PRODUCT_IDS[selectedUnitCount], quantity: orderQuantity }],
      });

      window.alert('결제가 완료되었습니다.');
      setPaymentError(null);
    } catch (err: any) {
      // PortOne V2에서 사용자 취소인 경우 (보통 code가 존재함)
      const isCancel = err.code === 'FAILURE_TYPE.PAYMENT_CANCELED' || err.message?.includes('취소');
      const message = isCancel ? '결제가 취소되었습니다.' : (err.message || '결제 중 오류가 발생했습니다.');
      
      setPaymentError({
        message,
        isCancel: !!isCancel,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-10 pt-10 pb-20 px-6 lg:px-0">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
        <div className="flex min-w-0 flex-col">
          <h1 className="Title2 font-bold text-card-title">이용권 관리</h1>

          <div className="mt-30 flex flex-wrap gap-6">
            <PassProductButton
              unitCount={1}
              unitPrice={getPassUnitPrice(1)}
              selected={selectedUnitCount === 1}
              onClick={setSelectedUnitCount}
            />
            <PassProductButton
              unitCount={3}
              unitPrice={getPassUnitPrice(3)}
              selected={selectedUnitCount === 3}
              onClick={setSelectedUnitCount}
            />
          </div>

          <div className="mt-30">
            <h2 className="Title3 px-4 py-8 font-bold text-card-title">결제정보</h2>
            <div className="h-[134px] rounded-3xl border border-card-border bg-card-bg px-8 py-8">
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <p className="Headline1 leading-6 font-semibold text-card-title">이용권 수</p>
                  <QuantityStepper
                    value={orderQuantity}
                    min={MIN_PASS_ORDER_QUANTITY}
                    max={MAX_PASS_ORDER_QUANTITY}
                    onDecrease={() =>
                      setOrderQuantity((prev) => Math.max(MIN_PASS_ORDER_QUANTITY, prev - 1))
                    }
                    onIncrease={() =>
                      setOrderQuantity((prev) => Math.min(MAX_PASS_ORDER_QUANTITY, prev + 1))
                    }
                  />
                </div>

                <div className="flex items-end justify-between">
                  <p className="Headline1 leading-6 font-semibold text-card-title">결제 예정 금액</p>
                  <p className="Title3 leading-10 font-bold text-[var(--color-primary)]">
                    {formatWon(expectedAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-30 border-t border-card-border pt-8">
            <p className="Label1 leading-6 font-semibold tracking-tight text-card-title">
              이용 및 환불 안내
            </p>
          </div>

          {paymentError && (
            <div className={`mt-30 flex items-center gap-3 rounded-2xl border px-6 py-4 ${
              paymentError.isCancel 
                ? 'border-[var(--ui-200)] bg-[var(--ui-50)] text-[var(--ui-600)]' 
                : 'border-[var(--negative-text)]/20 bg-[var(--negative-bg)] text-[var(--negative-text)]'
            }`}>
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-current opacity-20`}>
                <span className="text-white font-bold">!</span>
              </div>
              <p className="Label2 font-medium">{paymentError.message}</p>
            </div>
          )}

          <div className="mt-30 flex justify-end">
            <button
              type="button"
              onClick={handleProceedPayment}
              disabled={isProcessing || isPending}
              className="Headline1 flex items-center justify-center h-[48px] w-[240px] cursor-pointer rounded-[12px] bg-[var(--color-primary)] text-[15px] font-semibold text-white shadow-sm transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing || isPending ? '처리 중...' : '결제하기'}
            </button>
          </div>
        </div>

        <div className="hidden lg:block" aria-hidden />
      </div>
    </section>
  );
};

export default PayPage;
