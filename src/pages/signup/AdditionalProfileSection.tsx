import { useState } from 'react';
import { useThemeStore } from '@store/theme';
import {
  BACKEND_DATABASE,
  BACKEND_FRAMEWORK,
  BACKEND_LANGUAGE,
  FRONTEND_LANGUAGE_FRAMEWORK,
  FRONTEND_MOBILE,
  INFRA_CLOUD,
  INFRA_CONTAINER,
  getTechBadgeByName,
  type TechStackChip,
} from '@constants/position-tech-stack';

type AdditionalProfileSectionProps = {
  onBack: () => void;
  onNext: () => void;
};

const stackOptions = (
  [
    ...FRONTEND_LANGUAGE_FRAMEWORK,
    ...FRONTEND_MOBILE,
    ...BACKEND_LANGUAGE,
    ...BACKEND_FRAMEWORK,
    ...BACKEND_DATABASE,
    ...INFRA_CLOUD,
    ...INFRA_CONTAINER,
  ] as TechStackChip[]
).map((stack) => stack.label);

const AdditionalProfileSection = ({ onBack, onNext }: AdditionalProfileSectionProps) => {
  const { theme } = useThemeStore();
  const [stacks, setStacks] = useState<string[]>([]);
  const [summary, setSummary] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');

  const toggleStack = (value: string) => {
    setStacks((prev) => {
      if (prev.indexOf(value) !== -1) {
        return prev.filter((item) => item !== value);
      }
      return [...prev, value];
    });
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
            <div className="flex flex-wrap gap-2">
              {stackOptions.map((stack) => {
                const selected = stacks.indexOf(stack) !== -1;
                const badge = getTechBadgeByName(stack);
                const iconSrc = badge ? (theme === 'dark' ? badge.offDark ?? badge.off : badge.off) : undefined;
                return (
                  <button
                    key={stack}
                    type="button"
                    onClick={() => toggleStack(stack)}
                    className={`flex items-center gap-2 rounded-full px-3 py-1 text-[12px] ${
                      selected
                        ? 'bg-[var(--badge-bg-primary)] text-[var(--badge-text-primary)]'
                        : 'bg-[var(--ui-100)] text-[var(--ui-700)]'
                    }`}
                  >
                    {iconSrc && (
                      <img
                        src={iconSrc}
                        alt={`${stack} 로고`}
                        className="h-4 w-4"
                        loading="lazy"
                      />
                    )}
                    <span className="font-semibold">{stack}</span>
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
              onClick={onNext}
              className="Body1 h-[48px] w-full rounded-xl bg-[#1E1D4D] text-[#7E7AFF]"
            >
              건너뛰기
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
