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
import './pay-page.css';

const formatWon = (value: number) => `${Math.max(0, value).toLocaleString('ko-KR')}원`;
const getPassUnitPrice = (unitCount: 1 | 3) => (unitCount === 1 ? 4900 : 9900);
const MIN_PASS_ORDER_QUANTITY = 1;
const MAX_PASS_ORDER_QUANTITY = 99;
const REPORT_PREVIEW_TABS = ['overview', 'analysis', 'insights'] as const;
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
  const [previewTab, setPreviewTab] = useState<'overview' | 'analysis' | 'insights'>('overview');
  const [isPreviewPaused, setIsPreviewPaused] = useState(false);
  const [paymentError, setPaymentError] = useState<{ message: string; isCancel?: boolean } | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedUnitPrice = useMemo(() => getPassUnitPrice(selectedUnitCount), [selectedUnitCount]);
  const expectedAmount = selectedUnitPrice * orderQuantity;
  const isLightTheme = theme === 'light';

  useEffect(() => {
    if (isPreviewPaused) return;

    const intervalId = window.setInterval(() => {
      setPreviewTab((currentTab) => {
        const currentIndex = REPORT_PREVIEW_TABS.indexOf(currentTab);
        return REPORT_PREVIEW_TABS[(currentIndex + 1) % REPORT_PREVIEW_TABS.length];
      });
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [isPreviewPaused]);

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

      <div className="grid items-start gap-[2.4rem] lg:grid-cols-[minmax(0,1.55fr)_minmax(32rem,0.8fr)]">
        <section
          aria-labelledby="report-preview-title"
          onMouseEnter={() => setIsPreviewPaused(true)}
          onMouseLeave={() => setIsPreviewPaused(false)}
          onFocusCapture={() => setIsPreviewPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setIsPreviewPaused(false);
            }
          }}
          className={`relative min-w-0 rounded-[1.8rem] border p-[3.2rem] max-[743px]:p-[2rem] ${
            isLightTheme
              ? 'border-card-border bg-white shadow-[0_1.8rem_5rem_rgba(15,23,42,0.08)]'
              : 'border-[rgba(127,133,150,0.2)] bg-[linear-gradient(135deg,rgba(31,33,39,0.98),rgba(20,21,25,0.98))] shadow-[0_1.8rem_5rem_rgba(0,0,0,0.24)]'
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

          <div className="flex gap-[2.4rem] border-b border-card-border max-[743px]:gap-[1.8rem] max-[743px]:overflow-x-auto" role="tablist" aria-label="리포트 미리보기 섹션">
            {([
              ['overview', '프로젝트 개요'],
              ['analysis', '기술 분석'],
              ['insights', '핵심 인사이트'],
            ] as const).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={previewTab === tab}
                onClick={() => setPreviewTab(tab)}
                className={`relative shrink-0 px-[0.8rem] py-[1.2rem] text-[1.4rem] font-medium transition-colors ${
                  previewTab === tab ? 'text-[#C6B2FF]' : 'text-[var(--ui-500)] hover:text-card-title'
                }`}
              >
                {label}
                {previewTab === tab ? (
                  <span className="absolute right-0 bottom-[-1px] left-0 h-[0.3rem] rounded-full bg-[#A78BFA]" />
                ) : null}
              </button>
            ))}
          </div>

          <div
            key={previewTab}
            className="pay-report-page-enter min-h-[42rem] pt-[3.2rem] max-[743px]:min-h-[36rem]"
            role="tabpanel"
            aria-live="off"
          >
            {previewTab === 'overview' ? (
              <>
                <p className="text-[1.1rem] font-medium tracking-[0.2em] text-[var(--ui-500)]">SAMPLE PROJECT</p>
                <h3 className="mt-[1rem] text-[3.2rem] leading-tight font-bold tracking-[-0.03em] text-card-title max-[743px]:text-[2.6rem]">
                  팀 프로젝트 협업 플랫폼
                </h3>
                <h4 className="mt-[2.2rem] text-[1.6rem] font-semibold text-card-title">프로젝트 개요</h4>
                <p className="mt-[0.8rem] text-[1.5rem] leading-[1.7] text-[var(--ui-500)]">
                  팀원을 찾고, 프로젝트의 진행 과정을 함께 관리하는 웹 서비스입니다.
                </p>
                <div className="mt-[2rem] grid gap-[1.8rem] border-t border-card-border pt-[2.4rem] sm:grid-cols-2">
                  <div>
                    <h4 className="text-[1.5rem] font-semibold text-card-title">프로젝트 목표</h4>
                    <p className="mt-[0.8rem] text-[1.4rem] leading-[1.6] text-[var(--ui-500)]">
                      모집부터 협업까지 하나의 흐름으로 연결
                    </p>
                  </div>
                  <div className="border-l border-card-border pl-[2rem] max-[639px]:border-l-0 max-[639px]:pl-0">
                    <h4 className="text-[1.5rem] font-semibold text-card-title">주요 기능</h4>
                    <p className="mt-[0.8rem] text-[1.4rem] leading-[1.6] text-[var(--ui-500)]">
                      팀원 모집 · 프로젝트 관리 · 진행 기록
                    </p>
                  </div>
                </div>
                <div className={`mt-[2.4rem] rounded-[1.2rem] border p-[1.8rem] ${isLightTheme ? 'border-card-border bg-[#F8F8FC]' : 'border-[rgba(127,133,150,0.14)] bg-[rgba(255,255,255,0.035)]'}`}>
                  <p className="text-[1.5rem] font-semibold text-card-title">핵심 요약</p>
                  <p className="mt-[0.8rem] text-[1.35rem] leading-[1.65] text-[var(--ui-500)]">
                    프로젝트의 목적과 주요 기능, 구현 과정에서의 선택과 경험을 한눈에 살펴볼 수 있습니다.
                  </p>
                </div>
              </>
            ) : previewTab === 'analysis' ? (
              <>
                <p className="text-[1.1rem] font-medium tracking-[0.2em] text-[var(--ui-500)]">TECH STACK</p>
                <h3 className="mt-[1rem] text-[3.2rem] leading-tight font-bold tracking-[-0.03em] text-card-title max-[743px]:text-[2.6rem]">
                  기술 구성과 선택 이유
                </h3>
                <p className="mt-[1.6rem] text-[1.5rem] leading-[1.7] text-[var(--ui-500)]">
                  프로젝트에서 사용한 기술과 각 기술이 맡은 역할을 정리합니다.
                </p>
                <div className="mt-[2.4rem] flex flex-wrap gap-[0.8rem]">
                  {['React', 'TypeScript', 'Spring Boot', 'PostgreSQL', 'Docker'].map((stack) => (
                    <span key={stack} className="rounded-full border border-card-border px-[1.2rem] py-[0.7rem] text-[1.25rem] font-medium text-card-title">
                      {stack}
                    </span>
                  ))}
                </div>
                <div className="mt-[2.8rem] space-y-[1.8rem] border-t border-card-border pt-[2.2rem]">
                  <div>
                    <h4 className="text-[1.5rem] font-semibold text-card-title">프론트엔드</h4>
                    <p className="mt-[0.6rem] text-[1.35rem] leading-[1.6] text-[var(--ui-500)]">컴포넌트 단위로 화면을 구성하고 타입 안정성을 확보했습니다.</p>
                  </div>
                  <div>
                    <h4 className="text-[1.5rem] font-semibold text-card-title">백엔드 · 인프라</h4>
                    <p className="mt-[0.6rem] text-[1.35rem] leading-[1.6] text-[var(--ui-500)]">서비스 요구에 맞춰 API와 데이터 저장 구조를 설계했습니다.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-[1.1rem] font-medium tracking-[0.2em] text-[var(--ui-500)]">CORE INSIGHTS</p>
                <h3 className="mt-[1rem] text-[3.2rem] leading-tight font-bold tracking-[-0.03em] text-card-title max-[743px]:text-[2.6rem]">
                  함께 만든 과정에서 찾은 인사이트
                </h3>
                <p className="mt-[1.6rem] text-[1.5rem] leading-[1.7] text-[var(--ui-500)]">
                  결과물뿐 아니라 문제를 정의하고 해결한 과정을 되짚어 봅니다.
                </p>
                <div className="mt-[2.6rem] space-y-[1.2rem]">
                  {[
                    ['01', '작은 단위로 나눈 협업', '역할과 작업 범위를 분명히 해 진행 상황을 공유했습니다.'],
                    ['02', '사용자 흐름을 먼저 설계', '핵심 동선을 기준으로 기능의 우선순위를 정했습니다.'],
                    ['03', '반복 가능한 개발 환경', '팀원 누구나 같은 방식으로 실행할 수 있게 구성했습니다.'],
                  ].map(([number, title, description]) => (
                    <div key={number} className="flex gap-[1.4rem] border-t border-card-border py-[1.6rem]">
                      <span className="text-[1.2rem] font-semibold text-[#B49AFF]">{number}</span>
                      <div>
                        <h4 className="text-[1.5rem] font-semibold text-card-title">{title}</h4>
                        <p className="mt-[0.5rem] text-[1.3rem] leading-[1.6] text-[var(--ui-500)]">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <p className="mt-[1.2rem] text-[1.15rem] text-[var(--ui-500)]">
            실제 리포트 구성은 프로젝트에 따라 달라질 수 있어요.
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

          <div className="mt-[2.4rem] border-y border-card-border">
            <div className="flex min-h-[6.2rem] items-center justify-between gap-[1.2rem] text-[1.4rem]">
              <span className="text-[var(--ui-500)]">제공 이용권</span>
              <span className="font-semibold text-card-title">총 {selectedUnitCount * orderQuantity}개</span>
            </div>
            <div className="flex min-h-[7.2rem] items-center justify-between gap-[1.2rem] border-t border-card-border">
              <span className="text-[1.4rem] text-card-title">총 결제 금액</span>
              <span className="text-[2.8rem] font-bold tracking-[-0.03em] text-card-title">
                {formatWon(expectedAmount)}
              </span>
            </div>
          </div>

          <div className="mt-[1.8rem] flex items-center justify-between gap-[1.2rem]">
            <span className="text-[1.4rem] text-card-title">수량</span>
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
