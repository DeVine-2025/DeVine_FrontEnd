import { useMemo, useState } from 'react';
import CheckboxCheckedIcon from '@assets/icons/checkbox-checked.svg?react';
import CheckboxUncheckedIcon from '@assets/icons/checkbox-unchecked.svg?react';

type ProfilePageProps = {
  onBack: () => void;
  onNext: () => void;
};

const roleOptions = [
  { key: 'pm', label: 'PM' },
  { key: 'dev', label: '개발자' },
];

const domainOptions = [
  '교육',
  '헬스케어',
  '소셜/커뮤니티',
  '핀테크',
  '엔터테인먼트',
  '이커머스',
  'AI/데이터',
];

const USER_ROLE_KEY = 'userRole';

const ProfilePage = ({ onBack, onNext }: ProfilePageProps) => {
  const [role, setRole] = useState<'pm' | 'dev' | null>(
    (localStorage.getItem(USER_ROLE_KEY) as 'pm' | 'dev' | null) ?? 'pm',
  );
  const [domains, setDomains] = useState<string[]>([]);

  const canProceed = useMemo(() => role !== null && domains.length > 0, [role, domains]);

  const toggleDomain = (value: string) => {
    setDomains((prev) => {
      if (prev.indexOf(value) !== -1) {
        return prev.filter((item) => item !== value);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, value];
    });
  };

  const handleRoleChange = (nextRole: 'pm' | 'dev') => {
    setRole(nextRole);
    localStorage.setItem(USER_ROLE_KEY, nextRole);
  };

  return (
    <div className="mx-auto flex h-[660px] w-full max-w-[632px] flex-col rounded-[32px] bg-[var(--ui-bg)] px-10 pb-20 pt-10 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-[var(--ui-1000)]">
          <h2 className="Heading2 font-semibold">기본 정보를 입력해주세요</h2>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="Body1 text-[var(--ui-900)]">메인 권한 설정</span>
            <span className="Caption1 text-[var(--ui-400)]">
              선택한 권한에 맞춰 가장 필요한 정보를 메인 화면에 먼저 확인할 수 있습니다.
            </span>
            <div className="flex items-center gap-8 pt-2">
              {roleOptions.map((option) => {
                const selected = role === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handleRoleChange(option.key as 'pm' | 'dev')}
                    className="flex items-center gap-3 text-[var(--ui-900)]"
                    aria-pressed={selected}
                  >
                    <span
                      className={`relative flex h-7 w-7 items-center justify-center rounded-full border ${
                        selected ? 'border-[#4E49FF]' : 'border-[var(--ui-200)]'
                      }`}
                    >
                      {selected && (
                        <span className="h-3 w-3 rounded-full bg-[#4E49FF]" />
                      )}
                    </span>
                    <span className="Body1">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="Body1 text-[var(--ui-900)]">관심 도메인</span>
              <span className="Caption1 text-[var(--ui-400)]">(최대 3개)</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {domainOptions.map((domain) => {
                const selected = domains.indexOf(domain) !== -1;
                return (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => toggleDomain(domain)}
                    className="flex items-center gap-3 text-[var(--ui-900)]"
                    aria-pressed={selected}
                  >
                    {selected ? (
                      <CheckboxCheckedIcon className="h-7 w-7 shrink-0 text-[#4E49FF]" aria-hidden="true" />
                    ) : (
                      <CheckboxUncheckedIcon className="h-7 w-7 shrink-0" aria-hidden="true" />
                    )}
                    <span className="Body1">{domain}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto mb-24 flex flex-col gap-3">
        <button
          type="button"
          disabled={!canProceed}
          onClick={onNext}
          className={`Body1 h-[48px] w-full rounded-xl font-semibold ${
            canProceed
              ? 'bg-[#4E49FF] text-white'
              : 'bg-[var(--ui-100)] text-[var(--ui-400)]'
          }`}
        >
          다음
        </button>
        <button type="button" onClick={onBack} className="Body1 text-[var(--ui-400)]">
          돌아가기
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
