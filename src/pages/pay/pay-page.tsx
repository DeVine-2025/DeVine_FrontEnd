import { useMemo, useState } from 'react';
import PassProductButton from './components/PassProductButton';
import QuantityStepper from './components/QuantityStepper';

const formatWon = (value: number) => `${Math.max(0, value).toLocaleString('ko-KR')}원`;
const getPassUnitPrice = (unitCount: 1 | 3) => (unitCount === 1 ? 4900 : 9900);
const MIN_PASS_ORDER_QUANTITY = 1;
const MAX_PASS_ORDER_QUANTITY = 99;
const PAYMENT_PLATFORM_URL = import.meta.env.VITE_PAYMENT_PLATFORM_URL as string | undefined;

const PayPage = () => {
  const [selectedUnitCount, setSelectedUnitCount] = useState<1 | 3>(1);
  const [orderQuantity, setOrderQuantity] = useState<number>(MIN_PASS_ORDER_QUANTITY);
  const selectedUnitPrice = useMemo(
    () => getPassUnitPrice(selectedUnitCount),
    [selectedUnitCount],
  );

  const expectedAmount = selectedUnitPrice * orderQuantity;
  const handleProceedPayment = () => {
    if (!PAYMENT_PLATFORM_URL) {
      // TODO: 실제 결제 플랫폼 URL 확정 시 .env에 세팅
      window.alert('결제 플랫폼 주소가 설정되지 않았어요.');
      return;
    }

    const params = new URLSearchParams({
      productType: 'REPORT_PASS',
      passUnitCount: String(selectedUnitCount),
      quantity: String(orderQuantity),
      unitPrice: String(selectedUnitPrice),
      totalAmount: String(expectedAmount),
      currency: 'KRW',
    });

    window.location.assign(`${PAYMENT_PLATFORM_URL}?${params.toString()}`);
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
                  <p className="Headline1 leading-6 font-semibold text-card-title">
                    결제 예정 금액
                  </p>
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

          <div className="mt-30 flex justify-end">
            <button
              type="button"
              onClick={handleProceedPayment}
              className="h-[42px] w-[240px] cursor-pointer rounded-[10px] bg-[var(--color-primary)] Headline1 text-[14px] text-white"
            >
              결제하기
            </button>
          </div>
        </div>

        {/* 우측 칸 자리 잡아두기 용 더미 div */}
        <div className="hidden lg:block" aria-hidden />
      </div>
    </section>
  );
};

export default PayPage;
