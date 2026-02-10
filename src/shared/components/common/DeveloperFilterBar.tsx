import ChevronDownIcon from '@assets/icons/chevron-down.svg?react';
import DomainDropdown from '@components/recommend/DomainDropdown';
import MyProjectDropdown from '@components/recommend/MyProjectDropdown';
import PositionTechStackDropdown from '@components/recommend/PositionTechStackDropdown';

export type DeveloperFilterKey = '내 프로젝트 선택' | '포지션 / 기술스택' | '관심 도메인';

type Props = {
  filters: readonly DeveloperFilterKey[];

  openFilter: DeveloperFilterKey | null;
  setOpenFilter: (v: DeveloperFilterKey | null) => void;

  myProjects: string[];
  setMyProjects: (v: string[]) => void;
  myProjectOptions?: Array<{ id: number; name: string }>;
  myProjectOptionsLoading?: boolean;

  techStacks: string[];
  setTechStacks: (v: string[]) => void;

  interestDomains: string[];
  setInterestDomains: (v: string[]) => void;

  onApply?: (key: DeveloperFilterKey) => void;
  onReset?: (key: DeveloperFilterKey) => void;
};

export default function DeveloperFilterBar({
  filters,
  openFilter,
  setOpenFilter,

  myProjects,
  setMyProjects,
  myProjectOptions,
  myProjectOptionsLoading,
  techStacks,
  setTechStacks,
  interestDomains,
  setInterestDomains,

  onApply,
  onReset,
}: Props) {
  const baseClass =
    'inline-flex max-w-[260px] cursor-pointer items-center gap-[10px] rounded-full px-5 py-4 font-semibold text-xl transition-colors';
  const appliedClass =
    'border border-[var(--badge-bg-primary)] bg-[var(--badge-bg-primary)] text-[var(--badge-text-primary)]';
  const defaultClass = 'border border-transparent bg-filter-bg text-filter-text';
  // 오픈 시 바깥 링 없이 테두리 색만 변경 (기본 border-transparent를 확실히 override)
  const openClass = '!border-[#4E49FF]';

  const getValues = (label: DeveloperFilterKey) => {
    if (label === '내 프로젝트 선택') return myProjects;
    if (label === '포지션 / 기술스택') return techStacks;
    if (label === '관심 도메인') return interestDomains;
    return [];
  };

  const close = () => setOpenFilter(null);

  return (
    <div className="flex flex-wrap gap-4">
      {filters.map((label) => {
        const values = getValues(label);
        const isApplied = values.length > 0;
        const isOpen = openFilter === label;

        const uniq = Array.from(new Set(values));
        const optionNames =
          label === '내 프로젝트 선택' ? myProjectOptions?.map((o) => o.name) ?? [] : [];
        const isAllProjectsSelected =
          label === '내 프로젝트 선택' &&
          optionNames.length > 0 &&
          uniq.length === optionNames.length &&
          optionNames.every((name) => uniq.includes(name));

        const shown = uniq.slice(0, 2);
        const rest = Math.max(0, uniq.length - shown.length);
        const summary = `${shown.join(', ')}${rest > 0 ? '…' : ''}`;
        const displayLabel =
          label === '내 프로젝트 선택' && isAllProjectsSelected
            ? '전체 프로젝트'
            : isApplied
              ? summary
              : label;

        return (
          <div key={label} className="relative">
            <button
              type="button"
              onClick={() => setOpenFilter(openFilter === label ? null : label)}
              className={`${baseClass} ${isApplied ? appliedClass : defaultClass} ${isOpen ? openClass : ''}`}
            >
              <span className="truncate">{displayLabel}</span>
              <ChevronDownIcon
                aria-hidden="true"
                className={`h-[14px] w-[14px] transition-transform duration-150 ${isOpen ? 'rotate-180' : ''} ${
                  isApplied ? 'text-[var(--badge-text-primary)]' : ''
                }`}
              />
            </button>

            {label === '내 프로젝트 선택' ? (
              <MyProjectDropdown
                open={openFilter === '내 프로젝트 선택'}
                value={myProjects}
                onChange={setMyProjects}
                options={myProjectOptions}
                loading={myProjectOptionsLoading}
                onApply={() => onApply?.('내 프로젝트 선택')}
                onReset={() => onReset?.('내 프로젝트 선택')}
                onClose={close}
              />
            ) : label === '포지션 / 기술스택' ? (
              <PositionTechStackDropdown
                open={openFilter === '포지션 / 기술스택'}
                value={techStacks}
                onChange={setTechStacks}
                onApply={() => onApply?.('포지션 / 기술스택')}
                onReset={() => onReset?.('포지션 / 기술스택')}
                onClose={close}
              />
            ) : label === '관심 도메인' ? (
              <DomainDropdown
                open={openFilter === '관심 도메인'}
                title="관심 도메인"
                value={interestDomains}
                onChange={setInterestDomains}
                onApply={() => onApply?.('관심 도메인')}
                onReset={() => onReset?.('관심 도메인')}
                onClose={close}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
