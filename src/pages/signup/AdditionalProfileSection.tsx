import { useState } from 'react';
import { useThemeStore } from '@store/theme';
import PositionTechStackDropdown from '@components/recommend/PositionTechStackDropdown';
import { getTechBadgeByName, TECH_STACK_LABEL_BY_KEY } from '@constants/position-tech-stack';
import { useAuth } from '@clerk/clerk-react';
import { signupMember, type SignupPayload } from '@apis/signup';
import { getTechstackNamesByKeys } from '@constants/signup-mapping';

type AdditionalProfileSectionProps = {
  onBack: () => void;
  onNext: () => void;
  signupData: Omit<SignupPayload, 'techstackNames' | 'body' | 'email' | 'linkedin'>;
};

const AdditionalProfileSection = ({ onBack, onNext, signupData }: AdditionalProfileSectionProps) => {
  const { theme } = useThemeStore();
  const [stacks, setStacks] = useState<string[]>([]);
  const [isTechStackOpen, setIsTechStackOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const { getToken } = useAuth();

  const hasAnyInput =
    stacks.length > 0 ||
    summary.trim().length > 0 ||
    email.trim().length > 0 ||
    linkedin.trim().length > 0;

  const removeStack = (key: string) => {
    setStacks((prev) => prev.filter((item) => item !== key));
  };

  const handleSubmit = async () => {
    const payload: SignupPayload = {
      ...signupData,
      techstackNames: getTechstackNamesByKeys(stacks),
      body: summary.trim().length > 0 ? summary.trim() : null,
      email: email.trim().length > 0 ? email.trim() : null,
      linkedin: linkedin.trim().length > 0 ? linkedin.trim() : null,
    };
    const token = await getToken();
    await signupMember(payload, token ?? undefined);
    onNext();
  };

  return (
    <div className="mx-auto flex h-[660px] w-full max-w-[632px] flex-col rounded-[32px] bg-[var(--ui-bg)] shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
      <div className="scrollbar-hide h-[520px] overflow-y-auto px-10 py-8">
        <div className="flex flex-col gap-2 text-[var(--ui-1000)]">
          <h2 className="Heading2 font-semibold">추가 정보를 입력해</h2>
          <h2 className="Heading2 font-semibold">프로필을 완성해보세요</h2>
        </div>

        <div className="mt-6 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <span className="Body1 text-[var(--ui-900)]">보유 스택</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTechStackOpen(true)}
                className="relative z-10 flex h-[40px] w-full cursor-pointer items-center gap-2 rounded-full border border-[var(--ui-100)] bg-[var(--ui-50)] px-4 text-[12px] text-[var(--ui-300)]"
              >
                <svg
                  className="h-4 w-4"
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
                  <button
                    key={key}
                    type="button"
                    onClick={() => removeStack(key)}
                    className="relative inline-flex items-center"
                  >
                    {iconSrc && (
                      <img
                        src={iconSrc}
                        alt={`${label} 배지`}
                        className="h-[32px] w-auto"
                        loading="lazy"
                      />
                    )}
                    <span
                      aria-hidden
                      className="absolute -right-[4px] -top-[4px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[var(--ui-50)] text-[11px] text-[#9EA6BA]"
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
              className="h-[44px] w-full rounded-2xl border border-[var(--ui-100)] bg-[var(--ui-50)] px-4 text-[var(--ui-900)] placeholder:text-[var(--ui-300)]"
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
              type="email"
              placeholder="이메일을 입력해주세요"
              className="h-[44px] w-full rounded-2xl border border-[var(--ui-100)] bg-[var(--ui-50)] px-4 text-[var(--ui-900)] placeholder:text-[var(--ui-300)]"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="Caption1 text-[var(--ui-500)]" htmlFor="profileLinkedin">
              링크드인
            </label>
            <input
              id="profileLinkedin"
              type="url"
              placeholder="링크드인 링크를 입력해주세요"
              className="h-[44px] w-full rounded-2xl border border-[var(--ui-100)] bg-[var(--ui-50)] px-4 text-[var(--ui-900)] placeholder:text-[var(--ui-300)]"
              value={linkedin}
              onChange={(event) => setLinkedin(event.target.value)}
            />
          </div>

          <div className="mt-14 flex flex-col gap-3 pb-4">
            <button
              type="button"
              onClick={handleSubmit}
              className={`Body1 h-[48px] w-full rounded-xl font-semibold ${
                hasAnyInput ? 'bg-[#4E49FF] text-white' : 'bg-[#1E1D4D] text-[#7E7AFF]'
              }`}
            >
              {hasAnyInput ? '회원가입하기' : '건너뛰기'}
            </button>
            <button type="button" onClick={onBack} className="Body1 text-[var(--ui-400)]">
              돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalProfileSection;
