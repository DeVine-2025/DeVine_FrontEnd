import { ArrowRight, Check, ChevronDown, CircleCheck, FileCode2 } from 'lucide-react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

type RecommendationMenuProps = {
  label: string;
  value: string;
  options: { value: string; label: string; icon?: ReactNode }[];
  onChange: (value: string) => void;
  developerFilter?: boolean;
  icon?: ReactNode;
};

export function RecommendationMenu({ label, value, options, onChange, developerFilter = false, icon }: RecommendationMenuProps) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Dropdown.Root modal={false}>
      <Dropdown.Trigger className="rec-menu-trigger" aria-label={label} data-filter-active={developerFilter && !!value ? true : undefined}>
        <span className="rec-menu-trigger-content">
          {selectedOption?.icon ?? icon}
          <span className="rec-menu-trigger-label">{selectedOption?.label ?? label}</span>
        </span>
        <ChevronDown size={14} aria-hidden="true" />
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content className={developerFilter ? 'rec-menu rec-menu--developer-filter' : 'rec-menu'} sideOffset={8} align={developerFilter ? 'start' : 'end'}>
          <Dropdown.RadioGroup value={value} onValueChange={onChange}>
            {options.map((option) => (
              <Dropdown.RadioItem className="rec-menu-item" value={option.value} key={option.value}>
                <span className="rec-menu-option-label">{option.icon}{option.label}</span>
                <Dropdown.ItemIndicator><Check size={14} /></Dropdown.ItemIndicator>
              </Dropdown.RadioItem>
            ))}
          </Dropdown.RadioGroup>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}

export function RecommendationBasis({ developer = false, title, children }: { developer?: boolean; title?: string; children?: ReactNode }) {
  return <div className={`rec-basis${developer ? ' rec-basis-developer' : ''}`}><span className="rec-basis-icon"><FileCode2 size={20} strokeWidth={1.5} /></span><div className="rec-basis-copy flex flex-col gap-[4px]"><span>{developer ? '추천 기준 프로젝트' : 'GitHub 리포트 기반 추천'}</span><strong>{title ?? (developer ? '함께할 팀을 선택해 주세요' : '기술 역량과 관심 분야를 기준으로 추천해요')}</strong></div><div className="rec-basis-action">{children ?? (!developer && <Link to="/report">내 리포트 확인 <ArrowRight size={15} /></Link>)}</div></div>;
}

export function RecommendationState({ title, description, to, action, retry }: { title: string; description: string; to?: string; action?: string; retry?: () => void }) {
  return <div className="rec-state mt-[24px] flex min-h-[380px] flex-col items-center justify-center rounded-[16px] border border-[var(--surface-badge)] bg-[var(--surface-filter)] p-[40px] text-center"><span className="rec-state-icon"><CircleCheck size={26} strokeWidth={1.4} /></span><h2>{title}</h2><p>{description}</p>{to && <Link className="rec-primary" to={to}>{action}<ArrowRight size={15} /></Link>}{retry && <button className="rec-primary" onClick={retry}>다시 시도</button>}</div>;
}

export function RecommendationSkeleton() {
  return <div className="rec-grid" role="status" aria-label="추천을 불러오는 중">{Array.from({ length: 6 }, (_, index) => <div key={index} className="rec-skeleton"><div /><span /><span /><span /></div>)}</div>;
}
