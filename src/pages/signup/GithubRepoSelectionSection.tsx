import { useEffect, useMemo, useState } from 'react';
import CheckboxCheckedIcon from '@assets/icons/checkbox-checked.svg?react';
import CheckboxUncheckedIcon from '@assets/icons/checkbox-unchecked.svg?react';

type GithubRepoSelectionSectionProps = {
  onBack: () => void;
  onNext: () => void;
};

const repoOptions = [
  { id: 'repo-1', name: '레포지토리 제목', desc: '레포지토리 설명이 들어가는 자리입니다.' },
  { id: 'repo-2', name: '레포지토리 제목', desc: '레포지토리 설명이 들어가는 자리입니다.' },
  { id: 'repo-3', name: '레포지토리 제목', desc: '레포지토리 설명이 들어가는 자리입니다.' },
  { id: 'repo-4', name: '레포지토리 제목', desc: '레포지토리 설명이 들어가는 자리입니다.' },
];

const GithubRepoSelectionSection = ({ onBack, onNext }: GithubRepoSelectionSectionProps) => {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [phase, setPhase] = useState<'select' | 'generating' | 'complete'>('select');
  const [tipIndex, setTipIndex] = useState(0);

  const tips = [
    {
      title: '이 리포트를 다른 사람에게도 보여줄까요?',
      body: '공개 설정은 내 마음대로 바꿀 수 있어요',
    },
    {
      title: '나와 맞는 프로젝트와 개발자들',
      body: '추천 프로젝트/개발자 탭에서 확인해보세요.',
    },
  ];

  const canProceed = useMemo(() => selectedRepo !== null, [selectedRepo]);

  const toggleRepo = (id: string) => {
    setSelectedRepo((prev) => (prev === id ? null : id));
  };

  const handleGenerate = () => {
    if (!canProceed || phase !== 'select') return;
    setPhase('generating');
    window.setTimeout(() => {
      setPhase('complete');
    }, 60000);
  };

  useEffect(() => {
    if (phase !== 'generating') return;
    setTipIndex(0);
    const timer = window.setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [phase, tips.length]);

  if (phase === 'generating') {
    return (
      <div className="mx-auto flex h-[660px] w-full max-w-[632px] flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-[160px] w-[160px] rounded-[16px] bg-[var(--ui-100)]" />
          <h2 className="Heading2 font-semibold text-[var(--ui-1000)]">리포트를 생성하는 중이에요</h2>
          <div className="flex flex-col items-center gap-2">
            <span className="Caption1 inline-flex items-center rounded-full bg-[var(--ui-100)] px-3 py-1 text-[var(--ui-500)]">
              TIP
            </span>
            <p className="Caption1 text-[var(--ui-400)]">
              {tips[tipIndex]?.title}
              <br />
              {tips[tipIndex]?.body}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="mx-auto flex h-[660px] w-full max-w-[632px] flex-col items-center justify-start gap-6 pt-[50px] text-center">
        <h2 className="text-[36px] leading-[133%] font-bold tracking-[-0.027em] text-[var(--ui-1000)]">
          리포트 생성이 완료되었어요!
        </h2>
        <div className="grid w-full max-w-[640px] grid-cols-2 gap-6">
          <div className="flex h-[298px] w-[308px] flex-col gap-3 rounded-[24px] border border-[#41444D] bg-[#191B1E] p-4 text-left">
            <span className="Caption1 inline-flex w-fit rounded-full bg-[#1E1D4D] px-2 py-1 text-[10px] text-[#7E7AFF]">
              메인
            </span>
            <h3 className="Body1 font-semibold text-[var(--ui-900)]">
              레포지토리 이름이 들어가는 자리입니다.
            </h3>
            <p className="Caption1 text-[var(--ui-400)]">
              레포지토리 설명이 들어가는 자리입니다.
              <br />
              레포지토리 설명이 들어가는 자리입니다.
            </p>
          </div>
          <div className="flex h-[298px] w-[308px] flex-col gap-3 rounded-[24px] border border-[#41444D] bg-[#191B1E] p-4 text-left">
            <span className="Caption1 inline-flex w-fit rounded-full bg-[#1E1D4D] px-2 py-1 text-[10px] text-[#7E7AFF]">
              상세
            </span>
            <h3 className="Body1 font-semibold text-[var(--ui-900)]">
              레포지토리 이름이 들어가는 자리입니다.
            </h3>
            <p className="Caption1 text-[var(--ui-400)]">
              레포지토리 설명이 들어가는 자리입니다.
              <br />
              레포지토리 설명이 들어가는 자리입니다.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onNext}
          className="mt-15 Body1 h-[48px] w-[280px] rounded-xl bg-[#4E49FF] font-semibold text-white"
        >
          메인 화면으로 이동하기
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[660px] w-full max-w-[632px] flex-col rounded-[32px] bg-[var(--ui-bg)] px-10 pb-20 pt-10 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2 text-[var(--ui-1000)]">
          <h2 className="Heading2 font-semibold">리포트를 생설할 <br/>레포지토리를 선택해주세요</h2>
        </div>
        <br/>
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
          onClick={handleGenerate}
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
