import { useMemo, useState } from 'react';
import CheckboxCheckedIcon from '@assets/icons/checkbox-checked.svg?react';
import CheckboxUncheckedIcon from '@assets/icons/checkbox-unchecked.svg?react';

type GithubRepoSelectionSectionProps = {
  onBack: () => void;
};

const repoOptions = [
  { id: 'repo-1', name: '레포지토리 제목', desc: '레포지토리 설명이 들어가는 자리입니다.' },
  { id: 'repo-2', name: '레포지토리 제목', desc: '레포지토리 설명이 들어가는 자리입니다.' },
  { id: 'repo-3', name: '레포지토리 제목', desc: '레포지토리 설명이 들어가는 자리입니다.' },
  { id: 'repo-4', name: '레포지토리 제목', desc: '레포지토리 설명이 들어가는 자리입니다.' },
];

const GithubRepoSelectionSection = ({ onBack }: GithubRepoSelectionSectionProps) => {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);

  const canProceed = useMemo(() => selectedRepo !== null, [selectedRepo]);

  const toggleRepo = (id: string) => {
    setSelectedRepo((prev) => (prev === id ? null : id));
  };

  return (
    <div className="mx-auto flex h-[660px] w-full max-w-[632px] flex-col rounded-[32px] bg-[var(--ui-bg)] px-10 pb-20 pt-10 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2 text-[var(--ui-1000)]">
          <h2 className="Heading2 font-semibold">깃허브로 회원가입 시</h2>
          <h2 className="Heading2 font-semibold text-[var(--badge-text-primary)]">
            1회 무료로 리포트를 생성해드려요!
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          <span className="Body1 text-[var(--ui-900)]">깃허브 레포지토리 목록</span>
          <div className="flex flex-col gap-4">
            {repoOptions.map((repo) => {
              const selected = selectedRepo === repo.id;
              return (
                <button
                  key={repo.id}
                  type="button"
                  onClick={() => toggleRepo(repo.id)}
                  className="flex items-start gap-3 text-left"
                  aria-pressed={selected}
                >
                  {selected ? (
                    <CheckboxCheckedIcon className="mt-1 h-7 w-7 shrink-0 text-[#4E49FF]" aria-hidden="true" />
                  ) : (
                    <CheckboxUncheckedIcon className="mt-1 h-7 w-7 shrink-0" aria-hidden="true" />
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="Body1 text-[var(--ui-900)]">{repo.name}</span>
                    <span className="Caption1 text-[var(--ui-400)]">{repo.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-auto mb-24 flex flex-col gap-3">
        <button
          type="button"
          disabled={!canProceed}
          className={`Body1 h-[48px] w-full rounded-xl font-semibold ${
            canProceed
              ? 'bg-[#4E49FF] text-white'
              : 'bg-[var(--ui-100)] text-[var(--ui-400)]'
          }`}
        >
          선택 완료
        </button>
        <button type="button" onClick={onBack} className="Body1 text-[var(--ui-400)]">
          돌아가기
        </button>
      </div>
    </div>
  );
};

export default GithubRepoSelectionSection;
