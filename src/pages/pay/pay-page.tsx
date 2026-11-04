import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getChannelKey } from '@apis/payment/payment';
import { useCompletePayment } from '@apis/payment/payment-queries';
import { requestPayment, type PgProvider } from '@apis/payment/requestPayment';
import TossPayLogoDark from '@assets/icons/tosspay-logo-dark.png';
import TossPayLogoWhite from '@assets/icons/tosspay-logo-white.png';
import { useThemeStore } from '@store/theme';
import PassProductButton from './components/PassProductButton';
import QuantityStepper from './components/QuantityStepper';
import MainDetail from '@components/report/MainDetail';
import { devineReportPreview } from './devine-report-preview';
import './pay-page.css';

const formatWon = (value: number) => `${Math.max(0, value).toLocaleString('ko-KR')}원`;
const getPassUnitPrice = (unitCount: 1 | 3) => (unitCount === 1 ? 4900 : 9900);
const MIN_PASS_ORDER_QUANTITY = 1;
const MAX_PASS_ORDER_QUANTITY = 99;
const REPORT_PREVIEW_SECTION_COUNT = 5;
const TICKET_PRODUCT_IDS: Record<1 | 3, number> = {
  1: 4,
  3: 5,
};

const PayPage = () => {
  const { mutateAsync: completePayment, isPending } = useCompletePayment();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { theme } = useThemeStore();

  const [selectedUnitCount, setSelectedUnitCount] = useState<1 | 3>(1);
  const [orderQuantity, setOrderQuantity] = useState<number>(MIN_PASS_ORDER_QUANTITY);
  const [previewTab, setPreviewTab] = useState(0);
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);
  const [isPreviewFocused, setIsPreviewFocused] = useState(false);
  const [paymentError, setPaymentError] = useState<{ message: string; isCancel?: boolean } | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedUnitPrice = useMemo(() => getPassUnitPrice(selectedUnitCount), [selectedUnitCount]);
  const expectedAmount = selectedUnitPrice * orderQuantity;
  const isLightTheme = theme === 'light';

  useEffect(() => {
    if (isPreviewHovered || isPreviewFocused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const intervalId = window.setInterval(() => {
      setPreviewTab((currentTab) => (currentTab + 1) % REPORT_PREVIEW_SECTION_COUNT);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [isPreviewHovered, isPreviewFocused]);

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
    <section className="mx-auto w-full max-w-[136rem] px-[2.4rem] pt-[4.8rem] pb-[8rem] max-[743px]:px-[1.6rem] max-[743px]:pt-[3.2rem]">
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

      <div className="grid items-start gap-[3.2rem] lg:grid-cols-[minmax(0,1.9fr)_minmax(32rem,0.8fr)]">
        <section
          aria-labelledby="report-preview-title"
          onMouseEnter={() => setIsPreviewHovered(true)}
          onMouseLeave={() => setIsPreviewHovered(false)}
          onFocusCapture={() => setIsPreviewFocused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setIsPreviewFocused(false);
            }
          }}
          className={`relative min-w-0 rounded-[1.8rem] border p-[2.4rem] max-[743px]:p-[1.8rem] ${
            isLightTheme
              ? 'border-card-border bg-white'
              : 'border-[rgba(127,133,150,0.2)] bg-[rgba(28,30,35,0.82)]'
          }`}
        >
          <div className="mb-[2.2rem] flex flex-wrap items-center gap-[1.2rem]">
            <h2 id="report-preview-title" className="text-[2.2rem] font-bold text-card-title">
              리포트 미리보기
            </h2>
            <span className="rounded-full bg-[rgba(180,154,255,0.12)] px-[1.2rem] py-[0.6rem] text-[1.2rem] font-semibold text-[#B49AFF]">
              샘플 리포트
            </span>
          </div>

          <div className="pay-preview-progress" aria-label={`샘플 리포트 ${previewTab + 1} / ${REPORT_PREVIEW_SECTION_COUNT}`}>
            <span>{String(previewTab + 1).padStart(2, '0')} / {String(REPORT_PREVIEW_SECTION_COUNT).padStart(2, '0')}</span>
            <div className="pay-preview-progress-track" aria-hidden="true">
              <span key={`${previewTab}-${isPreviewHovered}-${isPreviewFocused}`} className={isPreviewHovered || isPreviewFocused ? 'is-paused' : ''} />
            </div>
          </div>
          <div className="pay-report-preview" aria-label="DeVine 샘플 리포트">
            <MainDetail data={devineReportPreview} preview={{ active: previewTab, onSelect: setPreviewTab }} />
          </div>
          <p className="mt-[1.2rem] text-[1.15rem] text-[var(--ui-500)]">
            DeVine을 예시로 구성한 샘플이며, 프로젝트 규모를 포함한 내용은 실제 분석 결과가 아닙니다.
          </p>
        </section>

        <aside
          aria-labelledby="pass-purchase-title"
          className={`rounded-[1.8rem] border p-[2.4rem] max-[743px]:p-[1.8rem] ${
            isLightTheme
              ? 'border-card-border bg-white shadow-[0_1.8rem_5rem_rgba(15,23,42,0.06)]'
              : 'border-[rgba(127,133,150,0.2)] bg-[rgba(28,30,35,0.82)]'
          }`}
        >
          <h2 id="pass-purchase-title" className="mb-[1.8rem] text-[2.2rem] font-bold text-card-title">
            이용권 구매
          </h2>
          <div className="flex flex-col gap-[1.2rem]" role="radiogroup" aria-label="이용권 선택">
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

          <div className="mt-[2.4rem] border-t border-card-border pt-[1.8rem]">
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
              className={`mt-[1.6rem] rounded-[1rem] border px-[1.2rem] py-[1rem] text-[1.2rem] ${
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
            className={`mt-[1.8rem] flex h-[6rem] w-full cursor-pointer items-center justify-center rounded-[1.2rem] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
              theme === 'dark' ? 'bg-white' : 'bg-[#202532]'
            }`}
          >
            {isProcessing || isPending ? (
              <span className="text-[1.5rem] font-semibold text-card-title">처리 중...</span>
            ) : (
              <img
                src={theme === 'dark' ? TossPayLogoDark : TossPayLogoWhite}
                alt="토스페이로 결제하기"
                className="h-full max-w-full object-contain"
              />
            )}
          </button>
          <p className="mt-[1rem] text-center text-[1.2rem] text-[var(--ui-500)]">
            토스페이로 결제할 수 있어요.
          </p>

          <div className="mt-[2rem] border-t border-card-border pt-[1.4rem] text-center">
            <p className="text-[1.2rem] font-medium text-[var(--ui-500)]">이용 및 환불 안내</p>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default PayPage;
