import { formatTechstackKey, formatTechstackLabel, isTechnologySkill, normalizeTechstackName, type TechstackItem } from '@apis/techstacks';
import { ExploreTechIcon, getTechDisplayName } from '@components/cards/TechStackBadges';
import type { PositionKey } from '@constants/position-tech-stack';
import { useElasticUnderline } from '@hooks/useElasticUnderline';
import { useTechstacks } from '@hooks/useTechstacks';
import { Check, Layers, Search, X } from 'lucide-react';
import { useId, useLayoutEffect, useRef, useState } from 'react';
import { buildGenreGroups, TAB_GROUP_NAME, TAB_LABEL } from './tech-stack-groups';
import './tech-stack-picker.css';

type TechStackPickerProps = {
  value: string[];
  onApply: (value: string[]) => void;
  onClose: () => void;
  title: string;
  description: string;
  position?: PositionKey;
  valueType?: 'key' | 'id';
};

const allTabs = Object.keys(TAB_LABEL) as PositionKey[];
const techLabel = (name: string) => getTechDisplayName(formatTechstackLabel(name));

export default function TechStackPicker({
  value: initialValue,
  onApply,
  onClose,
  title,
  description,
  position,
  valueType = 'key',
}: TechStackPickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [value, setValue] = useState(initialValue);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<PositionKey>(position ?? 'frontend');
  const { data: techstackGroups = [], isLoading, isError, refetch } = useTechstacks();
  const tabs = position ? [position] : allTabs;

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  const { navRef, indicatorRef } = useElasticUnderline(activeTab, 'button[aria-pressed="true"]');
  const currentGroup = techstackGroups.find((group) => normalizeTechstackName(group.name) === TAB_GROUP_NAME[activeTab]);
  const genreGroups = buildGenreGroups(activeTab, currentGroup);
  const searchGroups = position ? techstackGroups.filter((group) => group === currentGroup) : techstackGroups;
  const selected = new Set(value);
  const toValue = (item: TechstackItem) =>
    valueType === 'id' ? String(item.techstackId) : formatTechstackKey(item.name);
  const toggle = (item: TechstackItem) => {
    const key = toValue(item);
    setValue(selected.has(key) ? value.filter((entry) => entry !== key) : [...value, key]);
  };

  const term = search.trim().toLowerCase();
  const matchingItems = term
    ? searchGroups.flatMap((group) => group.list).filter((item) =>
        isTechnologySkill(item) && techLabel(item.name).toLowerCase().includes(term),
      )
    : [];
  const visibleGroups = term
    ? [{ key: 'search', label: '검색 결과', items: matchingItems }]
    : genreGroups.map((group) => ({ ...group, items: group.items.filter(isTechnologySkill) }));
  const visibleKeys = new Set(visibleGroups.flatMap((group) => group.items.map(toValue)));
  const allVisibleSelected = visibleKeys.size > 0 && [...visibleKeys].every((key) => selected.has(key));

  return (
    <dialog
      ref={dialogRef}
      className="tech-stack-picker"
      aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="tech-stack-picker-panel">
        <header className="tech-stack-picker-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            <p>{description}</p>
          </div>
          <button className="tech-stack-picker-close" type="button" aria-label="닫기" onClick={onClose}>
            <X size={19} aria-hidden="true" />
          </button>
        </header>

        <label className="tech-stack-picker-search">
          <Search size={17} aria-hidden="true" />
          <input type="search" aria-label="기술 스택 검색" placeholder="React, TypeScript, Next.js 등" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>

        <nav ref={navRef} className="tech-stack-picker-tabs" aria-label="기술 스택 분류">
          {tabs.map((tab) => (
            <button key={tab} type="button" aria-pressed={activeTab === tab} onClick={() => { setActiveTab(tab); setSearch(''); }}>
              {TAB_LABEL[tab]}
            </button>
          ))}
          <span ref={indicatorRef} aria-hidden="true" />
        </nav>

        <div className="tech-stack-picker-body">
          {isLoading ? (
            <p role="status">기술 스택을 불러오는 중이에요.</p>
          ) : isError ? (
            <p role="status">목록을 불러오지 못했어요. <button type="button" onClick={() => void refetch()}>다시 시도</button></p>
          ) : visibleKeys.size === 0 ? (
            <p role="status">{term ? '검색 결과가 없어요.' : '이 분류에 기술 스택이 없어요.'}</p>
          ) : (
            <>
              <div className="tech-stack-picker-bulk">
                <button type="button" onClick={() => setValue(allVisibleSelected
                  ? value.filter((key) => !visibleKeys.has(key))
                  : [...new Set([...value, ...visibleKeys])])}>
                  <Check size={14} aria-hidden="true" />
                  {allVisibleSelected ? '전체 선택 해제' : '전체 선택'}
                </button>
              </div>
              {visibleGroups.filter((group) => group.items.length > 0).map((group) => (
                <section className="tech-stack-picker-group" key={group.key}>
                  <h3>{group.label}</h3>
                  <div className="tech-stack-picker-options">
                    {group.items.map((item) => (
                      <button key={item.techstackId} type="button" aria-pressed={selected.has(toValue(item))} onClick={() => toggle(item)}>
                        <span className="tech-stack-picker-icon" aria-hidden="true">
                          <ExploreTechIcon name={item.name} />
                          <Layers size={14} />
                        </span>
                        {techLabel(item.name)}
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}
        </div>

        <footer className="tech-stack-picker-footer">
          <span aria-live="polite">{selected.size}개 선택</span>
          <button type="button" className="tech-stack-picker-reset" disabled={selected.size === 0} onClick={() => setValue([])}>초기화</button>
          <button type="button" className="tech-stack-picker-save" onClick={() => { onApply(value); onClose(); }}>저장</button>
        </footer>
      </div>
    </dialog>
  );
}
