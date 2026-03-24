import SelectAllIcon from '@assets/icons/select-all.svg?react';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { getTechBadgeByName } from '@constants/position-tech-stack';
import {
  formatTechstackKey,
  formatTechstackLabel,
  normalizeTechstackName,
  type TechstackGroup,
  type TechstackItem,
} from '@apis/techstacks';
import { useTechstacks } from '@hooks/useTechstacks';
import { useThemeStore } from '@store/theme';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

type PositionTechStackDropdownProps = {
  open: boolean;
  value: string[];
  onChange: (next: string[]) => void;
  onApply?: () => void;
  onReset?: () => void;
  onClose: () => void;
  asModal?: boolean;
  title?: string;
  showCloseButton?: boolean;
  valueType?: 'key' | 'id';
};

type TabKey = 'frontend' | 'backend' | 'infra';

const TAB_LABEL: Record<TabKey, string> = {
  frontend: '프론트엔드',
  backend: '백엔드',
  infra: '인프라',
};

const TAB_GROUP_NAME: Record<TabKey, string> = {
  frontend: 'FRONTEND',
  backend: 'BACKEND',
  infra: 'INFRA',
};

const GENRE_LABEL_BY_TAB: Record<TabKey, Record<string, string>> = {
  frontend: {
    LANGUAGE: '언어/프레임워크',
    FRAMEWORK: '언어/프레임워크',
    LANGUAGE_FRAMEWORK: '언어/프레임워크',
    MOBILE: '모바일',
  },
  backend: {
    LANGUAGE: '언어',
    FRAMEWORK: '프레임워크',
    DATABASE: '데이터베이스',
  },
  infra: {
    CLOUD: '클라우드',
    CONTAINER: '컨테이너',
  },
};

const GENRE_ORDER_BY_TAB: Record<TabKey, string[]> = {
  frontend: ['LANGUAGE_FRAMEWORK', 'MOBILE'],
  backend: ['LANGUAGE', 'FRAMEWORK', 'DATABASE'],
  infra: ['CLOUD', 'CONTAINER'],
};

const buildGenreGroups = (tab: TabKey, group: TechstackGroup | undefined) => {
  if (!group) return [] as Array<{ key: string; label: string; items: TechstackItem[] }>;

  const genreMap = new Map<string, TechstackItem[]>();

  group.list.forEach((item) => {
    const rawGenre = normalizeTechstackName(item.genre);
    const mergedGenre =
      tab === 'frontend' && (rawGenre === 'LANGUAGE' || rawGenre === 'FRAMEWORK')
        ? 'LANGUAGE_FRAMEWORK'
        : rawGenre;

    const current = genreMap.get(mergedGenre) ?? [];
    current.push(item);
    genreMap.set(mergedGenre, current);
  });

  const order = GENRE_ORDER_BY_TAB[tab];
  const labelByGenre = GENRE_LABEL_BY_TAB[tab];

  const knownGroups = order
    .filter((genre) => (genreMap.get(genre)?.length ?? 0) > 0)
    .map((genre) => ({
      key: genre,
      label: labelByGenre[genre] ?? genre,
      items: genreMap.get(genre) ?? [],
    }));

  const customGroups = Array.from(genreMap.entries())
    .filter(([genre]) => !order.includes(genre))
    .map(([genre, items]) => ({
      key: genre,
      label: labelByGenre[genre] ?? genre,
      items,
    }));

  return [...knownGroups, ...customGroups];
};

export default function PositionTechStackDropdown({
  open,
  value,
  onChange,
  onApply,
  onReset,
  onClose,
  asModal = false,
  title = '포지션 기술스택',
  showCloseButton = false,
  valueType = 'key',
}: PositionTechStackDropdownProps) {
  const { theme } = useThemeStore();
  const { data: techstackGroups = [], isLoading } = useTechstacks();
  const ref = useRef<HTMLDivElement | null>(null);
  const selected = useMemo(() => new Set(value), [value]);

  const [activeTab, setActiveTab] = useState<TabKey>('frontend');
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const tabsRowRef = useRef<HTMLDivElement | null>(null);
  const tabsAreaRef = useRef<HTMLDivElement | null>(null);
  const frontendTabRef = useRef<HTMLButtonElement | null>(null);
  const backendTabRef = useRef<HTMLButtonElement | null>(null);
  const infraTabRef = useRef<HTMLButtonElement | null>(null);
  const [tabsTrack, setTabsTrack] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const [tabUnderline, setTabUnderline] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useEffect(() => {
    if (!open || asModal) return;

    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      const root = ref.current?.parentElement ?? ref.current;
      if (root && !root.contains(target)) onClose();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose, asModal]);

  const groupByTab = useMemo(() => {
    const map = new Map<string, TechstackGroup>();
    techstackGroups.forEach((group) => {
      map.set(normalizeTechstackName(group.name), group);
    });
    return map;
  }, [techstackGroups]);

  const currentGroup = groupByTab.get(TAB_GROUP_NAME[activeTab]);
  const genreGroups = useMemo(() => buildGenreGroups(activeTab, currentGroup), [activeTab, currentGroup]);

  const toValue = (item: TechstackItem) =>
    valueType === 'id' ? String(item.techstackId) : formatTechstackKey(item.name);

  const currentTabKeys = useMemo(
    () => currentGroup?.list.map((item) => toValue(item)) ?? [],
    [currentGroup, valueType],
  );
  const currentTabKeySet = useMemo(() => new Set(currentTabKeys), [currentTabKeys]);

  const toggle = (item: TechstackItem) => {
    const next = new Set(value);
    const key = toValue(item);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(Array.from(next));
  };

  const tabAllSelected = currentTabKeys.length > 0 && currentTabKeys.every((k) => selected.has(k));

  const toggleAll = () => {
    if (currentTabKeys.length === 0) return;

    if (tabAllSelected) {
      onChange(value.filter((k) => !currentTabKeySet.has(k)));
      return;
    }

    const next = new Set(value);
    currentTabKeys.forEach((k) => next.add(k));
    onChange(Array.from(next));
  };

  const renderChip = (item: TechstackItem) => {
    const key = toValue(item);
    const label = formatTechstackLabel(item.name);
    const isOn = selected.has(key);
    const badge = getTechBadgeByName(item.name);

    if (badge) {
      const offSrc = theme === 'dark' ? badge.offDark ?? badge.off : badge.off;
      const onSrc = theme === 'dark' ? badge.onDark ?? badge.on : badge.on;
      return (
        <button
          key={`${item.techstackId}-${key}`}
          type="button"
          onClick={() => toggle(item)}
          className="rounded-[999px] transition-transform duration-150 ease-out active:scale-[0.98]"
        >
          <img
            src={isOn ? onSrc : offSrc}
            alt={label}
            className="h-[36px] w-auto select-none rounded-[999px]"
            draggable={false}
          />
        </button>
      );
    }

    return (
      <button
        key={`${item.techstackId}-${key}`}
        type="button"
        onClick={() => toggle(item)}
        className={[
          'inline-flex h-[36px] items-center gap-[8px] rounded-[24px] px-[12px] py-[8px] text-left transition-transform duration-150 ease-out active:scale-[0.98]',
          'bg-[var(--ui-100)]',
          isOn ? 'ring-[#4E49FF] ring-[1.5px]' : 'ring-[1.5px] ring-[var(--ui-200)]',
        ].join(' ')}
      >
        <span className="Caption1 font-medium text-[var(--ui-800)]">{label}</span>
      </button>
    );
  };

  const measureTabs = () => {
    const container = tabsContainerRef.current;
    const row = tabsRowRef.current;
    const btn =
      activeTab === 'frontend'
        ? frontendTabRef.current
        : activeTab === 'backend'
          ? backendTabRef.current
          : infraTabRef.current;

    if (!container || !row || !btn) return;

    const containerRect = container.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    const trackExtra = 16;
    let trackLeft = rowRect.left - containerRect.left - trackExtra / 2;
    let trackWidth = rowRect.width + trackExtra;
    if (trackLeft < 0) {
      trackWidth += trackLeft;
      trackLeft = 0;
    }
    const trackMaxWidth = containerRect.width - trackLeft;
    if (trackWidth > trackMaxWidth) trackWidth = trackMaxWidth;

    const extra = 8;
    const areaLeft = containerRect.left + trackLeft;
    const areaWidth = trackWidth;

    let left = btnRect.left - areaLeft - extra / 2;
    let width = btnRect.width + extra;
    if (left < 0) {
      width += left;
      left = 0;
    }
    const maxWidth = areaWidth - left;
    if (width > maxWidth) width = maxWidth;
    if (activeTab === 'infra') width = areaWidth - left;

    setTabsTrack({ left: trackLeft, width: trackWidth });
    setTabUnderline({ left, width });
  };

  useLayoutEffect(() => {
    if (!open) return;
    measureTabs();
  }, [open, activeTab]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => measureTabs();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, activeTab]);

  if (!open) return null;

  const containerHeightClass = activeTab === 'backend' ? 'h-[480px]' : 'h-[420px]';
  const contentPaddingBottomClass = activeTab === 'backend' ? 'pb-[80px]' : 'pb-[72px]';
  const footerBottomClass = activeTab === 'backend' ? 'bottom-[8px]' : 'bottom-0';

  const dropdown = (
    <div
      ref={ref}
      className={`animate-dropdown-slide-up ${
        asModal
          ? 'w-[520px] rounded-[16px]'
          : 'absolute top-[calc(100%+12px)] left-0 z-50 w-[358px] rounded-[12px]'
      } overflow-hidden border border-[var(--ui-100)] bg-[var(--ui-50)] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.08)] ${containerHeightClass}`}
    >
      <div className="flex items-center justify-between px-[16px] pt-[16px]">
        <p className="Label1 font-medium text-[var(--ui-600)]">{title}</p>
        {showCloseButton && (
          <button type="button" onClick={onClose} className="text-[var(--ui-400)]" aria-label="닫기">
            ×
          </button>
        )}
      </div>

      <div className="px-[16px] pt-[20px]">
        <div ref={tabsContainerRef} className="w-full">
          <div
            ref={tabsRowRef}
            className="flex w-fit items-center gap-[24px] font-semibold text-[16px] leading-[1.5] tracking-[0.0912px]"
          >
            <button
              ref={frontendTabRef}
              type="button"
              onClick={() => setActiveTab('frontend')}
              className={`cursor-pointer ${activeTab === 'frontend' ? 'text-[var(--ui-700)]' : 'text-[var(--ui-400)]'}`}
            >
              {TAB_LABEL.frontend}
            </button>
            <button
              ref={backendTabRef}
              type="button"
              onClick={() => setActiveTab('backend')}
              className={`cursor-pointer ${activeTab === 'backend' ? 'text-[var(--ui-700)]' : 'text-[var(--ui-400)]'}`}
            >
              {TAB_LABEL.backend}
            </button>
            <button
              ref={infraTabRef}
              type="button"
              onClick={() => setActiveTab('infra')}
              className={`cursor-pointer ${activeTab === 'infra' ? 'text-[var(--ui-700)]' : 'text-[var(--ui-400)]'}`}
            >
              {TAB_LABEL.infra}
            </button>
          </div>

          <div className="relative mt-[8px] h-px w-full">
            <div
              ref={tabsAreaRef}
              className="absolute top-0 left-0 h-px rounded-[24px] bg-[var(--ui-100)]"
              style={{ width: `${tabsTrack.width}px`, transform: `translateX(${tabsTrack.left}px)` }}
            >
              <div
                className="absolute top-0 left-0 h-px rounded-[24px] bg-[var(--ui-300)] transition-[transform,width] duration-200 ease-out"
                style={{ width: `${tabUnderline.width}px`, transform: `translateX(${tabUnderline.left}px)` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-[93px] right-[16px] flex items-center gap-[4px]">
        <button
          type="button"
          onClick={toggleAll}
          className={`inline-flex items-center gap-[4px] transition-colors duration-150 ${
            tabAllSelected
              ? 'text-[#4E49FF] [&_path]:!stroke-[#4E49FF]'
              : 'text-[var(--ui-500)] hover:text-[#4E49FF] hover:[&_path]:!stroke-[#4E49FF]'
          }`}
        >
          <span aria-hidden className="inline-flex h-[20px] w-[20px] items-center justify-center">
            <SelectAllIcon aria-hidden className="h-[10px] w-[19px]" />
          </span>
          <span className="Label1 font-medium">전체 선택</span>
        </button>
      </div>

      <div
        className={`${asModal ? 'mx-0 px-[24px] w-full' : 'mx-auto w-[326px]'} mt-[33px] ${contentPaddingBottomClass} max-h-[320px] overflow-y-auto`}
      >
        {isLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner size="md" />
          </div>
        ) : genreGroups.length === 0 ? (
          <p className="Caption1 text-[var(--ui-400)]">기술스택 목록이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-[16px]">
            {genreGroups.map((genreGroup) => (
              <div key={genreGroup.key} className="flex flex-col gap-[12px]">
                <p className="Label1 font-medium text-[var(--ui-700)]">{genreGroup.label}</p>
                <div className="flex flex-wrap gap-[4px]">{genreGroup.items.map(renderChip)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className={`absolute right-0 flex h-[52px] w-[220px] items-center justify-end gap-[12px] px-[16px] ${footerBottomClass}`}
      >
        <button
          type="button"
          onClick={() => {
            onReset?.();
            onChange([]);
          }}
          className="Label1 flex h-[36px] w-[60px] cursor-pointer items-center justify-center rounded-[8px] bg-transparent px-[10px] text-[var(--ui-500)] hover:text-[var(--ui-700)]"
        >
          초기화
        </button>
        <button
          type="button"
          onClick={() => {
            onApply?.();
            onClose();
          }}
          className="Label1 flex h-[36px] w-[60px] cursor-pointer items-center justify-center rounded-[8px] bg-[#4E49FF] px-[10px] text-white"
        >
          저장
        </button>
      </div>
    </div>
  );

  if (!asModal) return dropdown;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-6" onClick={onClose}>
      <div onClick={(event) => event.stopPropagation()}>{dropdown}</div>
    </div>
  );
}

