import { useCallback, useEffect, useRef, useState } from 'react';
import { useThemeStore } from '@store/theme';
import PositionTechStackDropdown from '@components/recommend/PositionTechStackDropdown';
import { getTechBadgeByName, TECH_STACK_LABEL_BY_KEY } from '@constants/position-tech-stack';
import { useAuth } from '@clerk/clerk-react';
import { signupMember, type SignupPayload } from '@apis/signup';
import { getTechstackIdsByKeys } from '@constants/signup-mapping';
import { useOutletContext } from 'react-router-dom';
import type { RootLayoutOutletContext } from '@layouts/root-layout';

type AdditionalProfileSectionProps = {
  onBack: () => void;
  onNext: () => void;
  signupData: Omit<SignupPayload, 'techstackIds' | 'body' | 'email' | 'linkedin'>;
  onComplete?: () => Promise<void> | void;
  setLogoSubmitHandler?: (handler: (() => void) | null) => void;
};

type ToastType = 'success' | 'error';

const AdditionalProfileSection = ({
  onBack,
  onNext,
  signupData,
  onComplete,
  setLogoSubmitHandler,
}: AdditionalProfileSectionProps) => {
  const { theme } = useThemeStore();
  const [stacks, setStacks] = useState<string[]>([]);
  const [isTechStackOpen, setIsTechStackOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const { getToken } = useAuth();
  const { setLogoClickHandler } = useOutletContext<RootLayoutOutletContext>();

  const LINKEDIN_MAX_LENGTH = 255;

  const trimmedEmail = email.trim();
  const trimmedLinkedin = linkedin.trim();

  const isEmailValid = trimmedEmail.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const isLinkedinValid =
    trimmedLinkedin.length === 0 || /^https?:\/\/(www\.)?linkedin\.com\/.+/i.test(trimmedLinkedin);
  const isLinkedinLengthValid = trimmedLinkedin.length <= LINKEDIN_MAX_LENGTH;

  const showEmailError = trimmedEmail.length > 0 && !isEmailValid;
  const showLinkedinError = trimmedLinkedin.length > 0 && (!isLinkedinValid || !isLinkedinLengthValid);

  // 제출 중(버튼 비활성화)
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 1회 실행 락(연타 방지)
  const submitLockRef = useRef(false);

  // 간단 토스트(라이브러리 없이)
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const hasAnyInput =
    stacks.length > 0 || summary.trim().length > 0 || email.trim().length > 0 || linkedin.trim().length > 0;

  const removeStack = (key: string) => {
    setStacks((prev) => prev.filter((item) => item !== key));
  };

  const submitSignup = useCallback(
    async (onSuccess: () => void) => {
      if (!isEmailValid || !isLinkedinValid || !isLinkedinLengthValid) {
        showToast('error', '입력값을 확인해주세요.');
        return;
      }

      // 연타 방지
      if (submitLockRef.current) return;

      submitLockRef.current = true;
      setIsSubmitting(true);

      try {
        const payload: SignupPayload = {
          ...signupData,
          techstackIds: getTechstackIdsByKeys(stacks),
          body: summary.trim().length > 0 ? summary.trim() : null,
          email: trimmedEmail.length > 0 ? trimmedEmail : null,
          linkedin: trimmedLinkedin.length > 0 ? trimmedLinkedin : null,
        };

        const token = await getToken();
        if (!token) {
          throw new Error('missing token');
        }

        await signupMember(payload, token);
        if (onComplete) {
          await onComplete();
        }

        sessionStorage.setItem('skip_onboarding_modal_once', 'true');

        showToast('success', '가입이 완료되었습니다. 이동 중입니다…');
        onSuccess();
      } catch (e) {
        console.error(e);

        // 실패 시 복구
        submitLockRef.current = false;
        setIsSubmitting(false);

        showToast('error', '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    },
    [
      getToken,
      isEmailValid,
      isLinkedinLengthValid,
      isLinkedinValid,
      onComplete,
      signupData,
      stacks,
      summary,
      trimmedEmail,
      trimmedLinkedin,
    ],
  );

  const handleSubmit = async () => {
    await submitSignup(onNext);
  };

  const logoHandlerRef = useRef<null | (() => Promise<void>)>(null);

  useEffect(() => {
    logoHandlerRef.current = async () => {
      await submitSignup(onNext);
    };
  }, [onNext, submitSignup]);

  useEffect(() => {
    setLogoClickHandler(() => () => logoHandlerRef.current?.());
    setLogoSubmitHandler?.(() => logoHandlerRef.current?.());
    return () => {
      setLogoClickHandler(null);
      setLogoSubmitHandler?.(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto flex h-[560px] w-full max-w-[632px] flex-col rounded-[32px] bg-[var(--ui-bg)] shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
      {/* 토스트 UI (상단) */}
      {toast && (
        <div className="px-10 pt-6">
          <div
            role="status"
            aria-live="polite"
            className={`w-full rounded-2xl px-4 py-3 text-[14px] font-semibold shadow-[0_8px_18px_rgba(0,0,0,0.10)]
              ${toast.type === 'success' ? 'bg-[var(--color-primary)] text-white' : 'bg-[#FF4242] text-white'}`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden px-10 pt-5 pb-3">
        <div className="flex flex-col gap-2 text-[var(--ui-1000)]">
          <h2 className="Heading2 font-semibold">추가 정보를 입력해</h2>
          <h2 className="Heading2 font-semibold">프로필을 완성해보세요</h2>
        </div>

        <div className="scrollbar-hide mt-3 flex max-h-[330px] flex-col gap-6 overflow-y-auto pb-2">
          <div className="flex flex-col gap-4">
            <span className="Body1 font-semibold text-[var(--ui-900)]">보유 스택</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTechStackOpen(true)}
                className="relative z-10 flex h-[46px] w-full cursor-pointer items-center gap-2 rounded-full border border-[var(--ui-100)] bg-[var(--ui-50)] px-4 text-[16px] text-[var(--ui-300)]"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                보유 스택을 검색해주세요
              </button>
              <PositionTechStackDropdown
                open={isTechStackOpen}
                asModal
                title="보유 스택"
                showCloseButton
                value={stacks}
                onChange={setStacks}
                onApply={() => setIsTechStackOpen(false)}
                onReset={() => setStacks([])}
                onClose={() => setIsTechStackOpen(false)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {stacks.map((key) => {
                const label = TECH_STACK_LABEL_BY_KEY[key] ?? key;
                const badge = getTechBadgeByName(label);
                const iconSrc = badge ? (theme === 'dark' ? badge.offDark ?? badge.off : badge.off) : undefined;

                return (
                  <button key={key} type="button" onClick={() => removeStack(key)} className="relative inline-flex items-center">
                    {iconSrc && <img src={iconSrc} alt={`${label} 배지`} className="h-[32px] w-auto" loading="lazy" />}
                    <span
                      aria-hidden
                      className="absolute -right-[4px] -top-[4px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[var(--ui-50)] text-[11px] text-[var(--ui-400)]"
                    >
                      ×
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="Body1 text-[var(--ui-900)]" htmlFor="profileSummary">
              한줄 소개
            </label>
            <input
              id="profileSummary"
              type="text"
              placeholder="한줄 소개를 입력해주세요"
              className="h-[46px] w-full rounded-2xl border border-[var(--ui-100)] bg-[var(--ui-50)] px-4 text-[16px] text-[var(--ui-900)] placeholder:text-[var(--ui-300)]"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <span className="Body1 text-[var(--ui-900)]">연락처</span>
            <label className="Caption1 text-[var(--ui-500)]" htmlFor="profileEmail">
              이메일
            </label>
            <input
              id="profileEmail"
              type="text"
              placeholder="devine@example.com"
              className={`h-[46px] w-full rounded-2xl border bg-[var(--ui-50)] px-4 text-[16px] text-[var(--ui-900)] placeholder:text-[var(--ui-300)] ${
                showEmailError ? 'border-[#FF4242]' : 'border-[var(--ui-100)]'
              }`}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {showEmailError && (
              <span className="Caption1 text-[#FF4242]">이메일 형식이 올바르지 않아요. 예) devine@example.com</span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="Caption1 text-[var(--ui-500)]" htmlFor="profileLinkedin">
              링크드인
            </label>
            <input
              id="profileLinkedin"
              type="text"
              placeholder="https://www.linkedin.com/in/username"
              className={`h-[46px] w-full rounded-2xl border bg-[var(--ui-50)] px-4 text-[16px] text-[var(--ui-900)] placeholder:text-[var(--ui-300)] ${
                showLinkedinError ? 'border-[#FF4242]' : 'border-[var(--ui-100)]'
              }`}
              value={linkedin}
              onChange={(event) => setLinkedin(event.target.value)}
            />
            {showLinkedinError && (
              <span className="Caption1 text-[#FF4242]">
                {!isLinkedinLengthValid
                  ? `링크드인 URL은 ${LINKEDIN_MAX_LENGTH}자 이내로 입력해주세요.`
                  : '링크드인 URL 형식이 올바르지 않아요.'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-10 pb-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`Body1 h-[48px] w-full rounded-xl font-semibold ${
            hasAnyInput
              ? 'bg-[var(--color-primary)] text-white'
              : theme === 'dark'
                ? 'bg-[#1E1D4D] text-[#7E7AFF]'
                : 'bg-[#EEEDFF] text-[#4E49FF]'
          } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {isSubmitting ? '처리 중…' : hasAnyInput ? '회원가입' : '건너뛰기'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="Body1 inline-flex w-fit self-center text-[var(--ui-400)]"
        >
          <span>돌아가기</span>
        </button>
      </div>
    </div>
  );
};

export default AdditionalProfileSection;
