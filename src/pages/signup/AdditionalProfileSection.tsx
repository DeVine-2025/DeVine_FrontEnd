import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TechStackPicker from '@components/common/TechStackPicker';
import TechStackChip from '@components/common/TechStackChip';
import { useAuth } from '@clerk/clerk-react';
import { signupMember, type SignupPayload } from '@apis/signup';
import { buildTechstackNameByIdMap } from '@apis/techstacks';
import { useTechstacks } from '@hooks/useTechstacks';
import { useOutletContext } from 'react-router-dom';
import type { RootLayoutOutletContext } from '@layouts/root-layout';
import { ArrowLeft, Search } from 'lucide-react';

type AdditionalProfileSectionProps = {
  preview?: boolean;
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
  preview = false,
}: AdditionalProfileSectionProps) => {
  const [stacks, setStacks] = useState<string[]>([]);
  const [isTechStackOpen, setIsTechStackOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const { getToken } = useAuth();
  const { setLogoClickHandler } = useOutletContext<RootLayoutOutletContext>();
  const { data: techstackGroups = [] } = useTechstacks();
  const techstackNameById = useMemo(() => buildTechstackNameByIdMap(techstackGroups), [techstackGroups]);

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
      if (preview) {
        onSuccess();
        return;
      }

      // 연타 방지
      if (submitLockRef.current) return;

      submitLockRef.current = true;
      setIsSubmitting(true);

      try {
        const payload: SignupPayload = {
          ...signupData,
          techstackIds: stacks
            .map((stack) => Number(stack))
            .filter((id) => Number.isFinite(id) && id > 0),
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
      preview,
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
    <div className="mx-auto w-full max-w-[515px] text-[#f5f5f7]">
      {/* 토스트 UI (상단) */}
      {toast && (
        <div className="mb-5">
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

      <div>
        <div>
          <h2 className="text-[clamp(26px,3vw,36px)] font-bold leading-[1.3] tracking-[-.04em]">추가 정보를 입력해<br />프로필을 완성해보세요</h2>
          <p className="mt-4 text-[16px] leading-[1.6] text-[#b5b7c8]">선택 항목은 나중에 언제든지 변경할 수 있어요.</p>
        </div>

        <div className="mt-10 flex flex-col gap-7">
          <div className="flex flex-col gap-4">
            <span className="text-[16px] font-semibold text-[#f0f0f5]">보유 스택</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTechStackOpen(true)}
                className="relative z-10 flex h-[52px] w-full cursor-pointer items-center gap-3 rounded-[10px] border border-white/[0.12] bg-transparent px-4 text-left text-[15px] text-[#85889a] transition-colors hover:border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--project-accent)]"
              >
                <Search size={18} aria-hidden="true" />
                보유 스택을 검색해주세요
              </button>
              {isTechStackOpen && <TechStackPicker
                title="보유 스택 선택"
                description="사용할 수 있는 기술 스택을 선택해 주세요."
                value={stacks}
                valueType="id"
                onApply={setStacks}
                onClose={() => setIsTechStackOpen(false)}
              />}
            </div>

            <ul className="m-0 flex list-none flex-wrap items-center gap-2 p-0">
              {stacks.map((id) => {
                const rawName = techstackNameById.get(id) ?? id;
                return <TechStackChip key={id} name={rawName} onRemove={() => removeStack(id)} />;
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[16px] font-semibold text-[#f0f0f5]" htmlFor="profileSummary">
              한줄 소개
            </label>
            <input
              id="profileSummary"
              type="text"
              placeholder="한줄 소개를 입력해주세요"
              className="h-[52px] w-full rounded-[10px] border border-white/[0.12] bg-transparent px-4 text-[15px] text-[#f5f5f7] outline-none placeholder:text-[#85889a] focus:border-[var(--project-accent)]"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[16px] font-semibold text-[#f0f0f5]">연락처</span>
            <label className="text-[13px] text-[#a9abc0]" htmlFor="profileEmail">
              이메일
            </label>
            <input
              id="profileEmail"
              type="text"
              placeholder="devine@example.com"
              className={`h-[52px] w-full rounded-[10px] border bg-transparent px-4 text-[15px] text-[#f5f5f7] outline-none placeholder:text-[#85889a] focus:border-[var(--project-accent)] ${
                showEmailError ? 'border-[#c78f9d]' : 'border-white/[0.12]'
              }`}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {showEmailError && (
              <span className="text-[13px] text-[#d9a4ae]">이메일 형식이 올바르지 않아요. 예) devine@example.com</span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[13px] text-[#a9abc0]" htmlFor="profileLinkedin">
              링크드인
            </label>
            <input
              id="profileLinkedin"
              type="text"
              placeholder="https://www.linkedin.com/in/username"
              className={`h-[52px] w-full rounded-[10px] border bg-transparent px-4 text-[15px] text-[#f5f5f7] outline-none placeholder:text-[#85889a] focus:border-[var(--project-accent)] ${
                showLinkedinError ? 'border-[#c78f9d]' : 'border-white/[0.12]'
              }`}
              value={linkedin}
              onChange={(event) => setLinkedin(event.target.value)}
            />
            {showLinkedinError && (
              <span className="text-[13px] text-[#d9a4ae]">
                {!isLinkedinLengthValid
                  ? `링크드인 URL은 ${LINKEDIN_MAX_LENGTH}자 이내로 입력해주세요.`
                  : '링크드인 URL 형식이 올바르지 않아요.'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`h-[52px] w-full rounded-[10px] border text-[15px] font-semibold tracking-[-.01em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--project-accent)] ${
            hasAnyInput
              ? 'border-transparent bg-[var(--project-accent)] text-[#191824] hover:bg-[color-mix(in_srgb,var(--project-accent)_85%,white)]'
              : 'border-white/[0.12] bg-white/[0.035] text-[#d4cbff] hover:border-[var(--project-accent)]'
          } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {isSubmitting ? '처리 중…' : hasAnyInput ? '회원가입' : '건너뛰기'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit items-center self-center gap-2 text-[14px] text-[#a9abc0] transition-colors hover:text-[#f5f5f7]"
        >
          <ArrowLeft size={17} aria-hidden="true" /><span>돌아가기</span>
        </button>
      </div>
    </div>
  );
};

export default AdditionalProfileSection;
