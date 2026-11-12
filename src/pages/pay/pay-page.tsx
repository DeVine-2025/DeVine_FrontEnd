import ReportPreview from './components/report-preview';
import { usePassPayment } from './use-pass-payment';
import { useMemo, useState } from 'react';
import TossPayLogoDark from '@assets/icons/tosspay-logo-dark.png';
import PassProductButton from './components/PassProductButton';
import QuantityStepper from './components/QuantityStepper';
import './pay-page.css';

const formatWon = (value: number) => `${Math.max(0, value).toLocaleString('ko-KR')}원`;
const getPassUnitPrice = (unitCount: 1 | 3) => (unitCount === 1 ? 4900 : 9900);
const MIN_PASS_ORDER_QUANTITY = 1;
const MAX_PASS_ORDER_QUANTITY = 99;

const PayPage = () => {


  const [selectedUnitCount, setSelectedUnitCount] = useState<1 | 3>(1);
  const [orderQuantity, setOrderQuantity] = useState<number>(MIN_PASS_ORDER_QUANTITY);
  const selectedUnitPrice = useMemo(() => getPassUnitPrice(selectedUnitCount), [selectedUnitCount]);
  const expectedAmount = selectedUnitPrice * orderQuantity;
  const { handleProceedPayment, isProcessing, isPending, paymentError } = usePassPayment(selectedUnitCount, orderQuantity, expectedAmount);



  return (
    <section className="mx-auto desktop-content w-[var(--desktop-content-width,100%)] max-w-[136rem] px-[2.4rem] pt-[4.8rem] pb-[8rem] lg:max-2xl:pt-[clamp(30px,4svh,44px)] lg:max-2xl:pb-[64px] max-[743px]:px-[1.6rem] max-[743px]:pt-[3.2rem]">
      <header className="mb-[3.2rem] max-w-[82rem]">
        <p className="mb-[1.2rem] text-[1.4rem] font-semibold tracking-[0.08em] text-[#B49AFF]">
          리포트 이용권
        </p>
        <h1 className="text-[5.2rem] leading-[1.16] font-bold tracking-[-0.045em] text-card-title max-[743px]:text-[3.6rem]">
          프로젝트의 경험을,
          <br />
          한눈에 읽히는 리포트로.
        </h1>
        <p className="mt-[1.6rem] text-[1.8rem] leading-[1.65] text-[var(--ui-500)] max-[743px]:text-[1.5rem]">
          프로젝트 개요부터 기술 분석까지, 핵심 내용을 리포트로 정리해 보세요.
        </p>
      </header>

      <div className="grid items-start gap-[3.2rem] lg:max-2xl:gap-[24px] lg:grid-cols-[minmax(0,1.9fr)_minmax(32rem,0.8fr)]">
        <ReportPreview />

        <aside
          aria-labelledby="pass-purchase-title"
          className={`rounded-[1.8rem] border p-[2.4rem] max-[743px]:p-[1.8rem] lg:max-2xl:p-[18px] ${
            'border-[rgba(127,133,150,0.2)] bg-[rgba(28,30,35,0.82)]'
          }`}
        >
          <h2 id="pass-purchase-title" className="mb-[1.8rem] text-[2.2rem] font-bold text-card-title">
            이용권 구매
          </h2>
          <div className="flex flex-col gap-[1.2rem] lg:max-2xl:mt-[14px]" role="radiogroup" aria-label="이용권 선택">
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

          <div className="mt-[2.4rem] lg:max-2xl:mt-[14px] border-t border-card-border pt-[1.8rem]">
            <div className="flex items-center justify-between gap-[1.2rem] text-[1.4rem]">
              <span className="text-[var(--ui-500)]">제공 이용권</span>
              <span className="font-semibold text-card-title">총 {selectedUnitCount * orderQuantity}개</span>
            </div>
            <div className="mt-[1.6rem] flex items-center justify-between gap-[1.2rem]">
              <span className="text-[1.4rem] text-[var(--ui-500)]">수량</span>
              <QuantityStepper
                value={orderQuantity}
                min={MIN_PASS_ORDER_QUANTITY}
                max={MAX_PASS_ORDER_QUANTITY}
                onDecrease={() => setOrderQuantity((prev) => Math.max(MIN_PASS_ORDER_QUANTITY, prev - 1))}
                onIncrease={() => setOrderQuantity((prev) => Math.min(MAX_PASS_ORDER_QUANTITY, prev + 1))}
              />
            </div>
            <div className="mt-[1.8rem] flex items-center justify-between gap-[1.2rem] border-t border-card-border pt-[1.8rem]">
              <span className="text-[1.4rem] text-card-title">총 결제 금액</span>
              <span className="text-[2.8rem] font-bold tracking-[-0.03em] text-card-title">
                {formatWon(expectedAmount)}
              </span>
            </div>
          </div>

          {paymentError ? (
            <div
              className={`mt-[1.6rem] lg:max-2xl:mt-[14px] rounded-[1rem] border px-[1.2rem] py-[1rem] text-[1.2rem] ${
                paymentError.isCancel
                  ? 'border-[var(--ui-200)] bg-[var(--ui-50)] text-[var(--ui-600)]'
                  : 'border-[var(--negative-text)]/20 bg-[var(--negative-bg)] text-[var(--negative-text)]'
              }`}
              role="alert"
            >
              {paymentError.message}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleProceedPayment}
            disabled={isProcessing || isPending}
            aria-label={isProcessing || isPending ? '결제 처리 중' : '토스페이로 결제하기'}
            className={`mt-[1.8rem] flex h-[6rem] lg:max-2xl:h-[52px] w-full cursor-pointer items-center justify-center rounded-[1.2rem] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
              'bg-white'
            }`}
          >
            {isProcessing || isPending ? (
              <span className="text-[1.5rem] font-semibold text-card-title">처리 중...</span>
            ) : (
              <img
                src={TossPayLogoDark}
                alt="토스페이로 결제하기"
                className="h-full max-w-full object-contain"
              />
            )}
          </button>
          <p className="mt-[1rem] text-center text-[1.2rem] text-[var(--ui-500)]">
            토스페이로 결제할 수 있어요.
          </p>

          <div className="mt-[2rem] lg:max-2xl:mt-[14px] border-t border-card-border pt-[1.4rem] text-center">
            <p className="text-[1.2rem] font-medium text-[var(--ui-500)]">이용 및 환불 안내</p>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default PayPage;
