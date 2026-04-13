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
  const [paymentError, setPaymentError] = useState<string | null>(null);
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
    } catch (err) {
      const message = err instanceof Error ? err.message : '결제 중 오류가 발생했습니다.';
      setPaymentError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-10 pt-10 pb-20">
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

          {paymentError && <p className="text-sm text-red-500">{paymentError}</p>}

          <div className="mt-30 flex justify-end">
            <button
              type="button"
              onClick={handleProceedPayment}
              disabled={isProcessing || isPending}
              className="Headline1 h-[42px] w-[240px] cursor-pointer rounded-[10px] bg-[var(--color-primary)] text-[14px] text-white disabled:cursor-not-allowed disabled:opacity-50"
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
