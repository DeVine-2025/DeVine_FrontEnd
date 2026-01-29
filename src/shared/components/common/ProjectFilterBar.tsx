import ChevronDownIcon from '@assets/icons/chevron-down.svg?react';
import DomainDropdown from '@components/recommend/DomainDropdown';
import ExpectedPeriodDropdown from '@components/recommend/ExpectedPeriodDropdown';
import PositionTechStackDropdown from '@components/recommend/PositionTechStackDropdown';
import ProjectTypeDropdown from '@components/recommend/ProjectTypeDropdown';

export type ProjectFilterKey = '프로젝트 유형' | '도메인' | '예상 기간' | '포지션 / 기술스택';

type Props = {
  filters: readonly ProjectFilterKey[];
  openFilter: ProjectFilterKey | null;
  setOpenFilter: (v: ProjectFilterKey | null) => void;

  projectTypes: string[];
  setProjectTypes: (v: string[]) => void;

  domains: string[];
  setDomains: (v: string[]) => void;

  expectedPeriods: string[];
  setExpectedPeriods: (v: string[]) => void;

  techStacks: string[];
  setTechStacks: (v: string[]) => void;

  onApply?: (key: ProjectFilterKey) => void;
  onReset?: (key: ProjectFilterKey) => void;
};

export default function ProjectFiltersBar({
  filters,
  openFilter,
  setOpenFilter,

  projectTypes,
  setProjectTypes,
  domains,
  setDomains,
  expectedPeriods,
  setExpectedPeriods,
  techStacks,
  setTechStacks,

  onApply,
  onReset,
}: Props) {
  const getValues = (label: ProjectFilterKey) => {
    if (label === '프로젝트 유형') return projectTypes;
    if (label === '도메인') return domains;
    if (label === '예상 기간') return expectedPeriods;
    if (label === '포지션 / 기술스택') return techStacks;
    return [];
  };

  const renderButton = (label: ProjectFilterKey) => {
    const values = getValues(label);
    const isApplied = values.length > 0;
    const isOpen = openFilter === label;

    const uniq = Array.from(new Set(values));
    const shown = uniq.slice(0, 2);
    const rest = Math.max(0, uniq.length - shown.length);
    const summary = `${shown.join(', ')}${rest > 0 ? '…' : ''}`;
    const displayLabel = isApplied ? summary : label;

    const baseClass =
      'inline-flex max-w-[260px] cursor-pointer items-center gap-[10px] rounded-full px-5 py-4 font-semibold text-xl transition-colors';
    const appliedClass =
      'border border-[var(--badge-bg-primary)] bg-[var(--badge-bg-primary)] text-[var(--badge-text-primary)]';
    const defaultClass = 'border border-transparent bg-filter-bg text-filter-text';
    // 프로젝트 등록 SelectDropdown 오픈 테두리/링과 동일
    const openClass = 'border-[#4E49FF] shadow-[0_0_0_2px_rgba(78,73,255,0.15)]';

    return (
      <button
        type="button"
        onClick={() => setOpenFilter(openFilter === label ? null : label)}
        className={`${baseClass} ${isApplied ? appliedClass : defaultClass} ${isOpen ? openClass : ''}`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDownIcon
          aria-hidden="true"
          className={`h-[14px] w-[14px] transition-transform duration-150 ${isOpen ? 'rotate-180' : ''} ${isApplied ? 'text-[var(--badge-text-primary)]' : ''}`}
        />
      </button>
    );
  };

  const close = () => setOpenFilter(null);

  return (
    <div className="flex flex-wrap gap-4">
      {filters.map((label) => (
        <div key={label} className="relative">
          {renderButton(label)}

          {label === '프로젝트 유형' ? (
            <ProjectTypeDropdown
              open={openFilter === '프로젝트 유형'}
              value={projectTypes}
              onChange={setProjectTypes}
              onApply={() => onApply?.('프로젝트 유형')}
              onReset={() => onReset?.('프로젝트 유형')}
              onClose={close}
            />
          ) : label === '도메인' ? (
            <DomainDropdown
              open={openFilter === '도메인'}
              value={domains}
              onChange={setDomains}
              onApply={() => onApply?.('도메인')}
              onReset={() => onReset?.('도메인')}
              onClose={close}
            />
          ) : label === '예상 기간' ? (
            <ExpectedPeriodDropdown
              open={openFilter === '예상 기간'}
              value={expectedPeriods}
              onChange={setExpectedPeriods}
              onApply={() => onApply?.('예상 기간')}
              onReset={() => onReset?.('예상 기간')}
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
          ) : null}
        </div>
      ))}
    </div>
  );
}
