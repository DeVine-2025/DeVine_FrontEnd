import CheckboxCheckedIcon from '@assets/icons/checkbox-checked.svg?react';
import CheckboxUncheckedIcon from '@assets/icons/checkbox-unchecked.svg?react';
import ChevronLeftIcon from '@assets/icons/chevron-left.svg?react';
import type { useSignupTerms } from './use-signup-terms';
type Props = {
  termsState: ReturnType<typeof useSignupTerms>;
  preview: boolean;
  onConfirm: () => void;
};
export default function SignupAgreements({ termsState, preview, onConfirm: handleConfirm }: Props) {
  const {
    terms,
    agreedByTermsId,
    setAgreedByTermsId,
    isTermsLoading,
    requiredAgreed,
    allChecked,
    setActiveTermsId,
    handleAllChange,
  } = termsState;
  return (
    <div className="mx-auto w-full max-w-[515px] lg:max-2xl:max-w-[480px] text-[#f5f5f7]">
      <div className="flex flex-col gap-10">
        <div>
          <h2 className="lg:max-2xl:text-[30px] text-[clamp(26px,3vw,36px)] font-bold leading-[1.3] tracking-[-.04em]">
            서비스 이용을 위해
            <br />
            약관에 동의해주세요
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          <button
            type="button"
            role="checkbox"
            aria-checked={allChecked}
            onClick={() => handleAllChange(!allChecked)}
            className="flex min-h-[56px] w-full items-center gap-4 rounded-[10px] border border-white/[0.12] bg-white/[0.035] px-5 text-left transition-colors duration-200 hover:border-[#ada1fa]/50 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--project-accent)]"
          >
            {allChecked ? (
              <CheckboxCheckedIcon
                className="h-7 w-7 shrink-0 [&_rect]:fill-[color-mix(in_srgb,var(--project-accent)_80%,#30285b)] [&_path]:stroke-[#191824]"
                aria-hidden="true"
              />
            ) : (
              <CheckboxUncheckedIcon
                className="h-7 w-7 shrink-0 [&_rect]:fill-[#171821] [&_rect]:stroke-[#858ba5]"
                aria-hidden="true"
              />
            )}
            <span className="text-[17px] font-semibold text-[#f5f5f7]">전체 동의</span>
          </button>

          <div className="flex flex-col px-5">
            {terms.map((term, index) => {
              const checked = agreedByTermsId[term.termsId] === true;
              return (
                <div
                  key={term.termsId}
                  className={`flex min-h-[60px] items-center justify-between gap-3 ${index > 0 ? 'border-t border-white/[0.08]' : ''}`}
                >
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() =>
                      setAgreedByTermsId((prev) => ({
                        ...prev,
                        [term.termsId]: !checked,
                      }))
                    }
                    className="flex min-h-[60px] flex-1 items-center gap-5 text-left"
                  >
                    {checked ? (
                      <CheckboxCheckedIcon
                        className="h-7 w-7 shrink-0 [&_rect]:fill-[color-mix(in_srgb,var(--project-accent)_80%,#30285b)] [&_path]:stroke-[#191824]"
                        aria-hidden="true"
                      />
                    ) : (
                      <CheckboxUncheckedIcon
                        className="h-7 w-7 shrink-0 [&_rect]:fill-[#171821] [&_rect]:stroke-[#858ba5]"
                        aria-hidden="true"
                      />
                    )}
                    <span className="text-[16px] font-medium text-[#f0f0f5]">
                      <span className={term.required ? 'text-[#f0f0f5]' : 'text-[#999caf]'}>
                        [{term.required ? '필수' : '선택'}]
                      </span>{' '}
                      {term.title}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!preview) setActiveTermsId(term.termsId);
                    }}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center text-[#b5b7c8] hover:text-white"
                    aria-label={`${term.title} 보기`}
                  >
                    <ChevronLeftIcon className="h-5 w-5 rotate-180" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 lg:max-2xl:mt-6 flex flex-col gap-6">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!requiredAgreed || terms.length === 0 || isTermsLoading}
          className={`h-[52px] w-full rounded-[10px] text-[15px] font-semibold tracking-[-.01em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--project-accent)] ${
            requiredAgreed && terms.length > 0 && !isTermsLoading
              ? 'cursor-pointer border border-transparent bg-[var(--project-accent)] text-[#191824] hover:bg-[color-mix(in_srgb,var(--project-accent)_85%,white)]'
              : 'cursor-not-allowed border border-white/[0.10] bg-white/[0.035] text-[#8f92a3]'
          }`}
        >
          동의하고 계속하기
        </button>
      </div>
    </div>
  );
}
