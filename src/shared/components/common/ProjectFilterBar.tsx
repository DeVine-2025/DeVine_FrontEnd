import ChevronDownIcon from '@assets/icons/chevron-down.svg?react';
import { getKeysByPosition } from '@constants/position-tech-stack';
import DomainDropdown from '@components/recommend/DomainDropdown';
import ExpectedPeriodDropdown from '@components/recommend/ExpectedPeriodDropdown';
import PositionTechStackDropdown from '@components/recommend/PositionTechStackDropdown';
import ProjectTypeDropdown from '@components/recommend/ProjectTypeDropdown';

export type ProjectFilterKey = '프로젝트 유형' | '도메인' | '예상 기간' | '포지션 / 기술스택';

export const PROJECT_FILTERS: ProjectFilterKey[] = [
  '프로젝트 유형',
  '도메인',
  '예상 기간',
  '포지션 / 기술스택',
];

/** 필터별 전체 선택 시 버튼에 표시할 문구 */
const FILTER_ALL_LABELS: Record<ProjectFilterKey, string> = {
  '프로젝트 유형': '프로젝트 전체',
  도메인: '도메인 전체',
  '예상 기간': '예상기간 전체',
  '포지션 / 기술스택': '포지션/기술스택 전체',
};

/** 필터별 "전체" 옵션 목록 (드롭다운과 동일한 순서/내용) */
const PROJECT_TYPE_OPTIONS = ['웹', '모바일/앱', '게임', '블록체인', '기타'];
const DOMAIN_OPTIONS = ['헬스케어', '핀테크', '이커머스', '교육', '소셜/커뮤니티', '엔터테인먼트', 'AI/데이터', '기타'];
const EXPECTED_PERIOD_OPTIONS = ['1개월 이하', '1-3개월', '3-6개월', '6개월 이상'];
const POSITION_TECH_OPTIONS = [
  ...getKeysByPosition('frontend'),
  ...getKeysByPosition('backend'),
  ...getKeysByPosition('infra'),
];

function getAllOptions(label: ProjectFilterKey): string[] {
  if (label === '프로젝트 유형') return PROJECT_TYPE_OPTIONS;
  if (label === '도메인') return DOMAIN_OPTIONS;
  if (label === '예상 기간') return EXPECTED_PERIOD_OPTIONS;
  if (label === '포지션 / 기술스택') return POSITION_TECH_OPTIONS;
  return [];
}

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

    const uniq = Array.from(new Set(values.filter((v) => v !== '전체')));
    const allOptions = getAllOptions(label);
    const isAllSelected =
      allOptions.length > 0 && uniq.length === allOptions.length && allOptions.every((opt) => uniq.includes(opt));

    const displayLabel = isAllSelected
      ? FILTER_ALL_LABELS[label]
      : isApplied
        ? (() => {
            const shown = uniq.slice(0, 2);
            const rest = Math.max(0, uniq.length - shown.length);
            return `${shown.join(', ')}${rest > 0 ? '…' : ''}`;
          })()
        : label;

    const baseClass =
      'inline-flex max-w-[260px] cursor-pointer items-center gap-[10px] rounded-full px-5 py-4 font-semibold text-xl transition-colors';
    const appliedClass =
      'border border-[var(--badge-bg-primary)] bg-[var(--badge-bg-primary)] text-[var(--badge-text-primary)]';
    const defaultClass = 'border border-transparent bg-filter-bg text-filter-text';
    // 오픈 시 바깥 링 없이 테두리 색만 변경 (기본 border-transparent를 확실히 override)
    const openClass = '!border-[#4E49FF]';

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
