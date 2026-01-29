import SelectAllIcon from '@assets/icons/select-all.svg?react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  BACKEND_DATABASE,
  BACKEND_FRAMEWORK,
  BACKEND_LANGUAGE,
  FRONTEND_LANGUAGE_FRAMEWORK,
  FRONTEND_MOBILE,
  INFRA_CLOUD,
  INFRA_CONTAINER,
  type TechStackChip,
} from '@constants/position-tech-stack';

type PositionTechStackDropdownProps = {
  open: boolean;
  value: string[];
  onChange: (next: string[]) => void;
  onApply?: () => void;
  onReset?: () => void;
  onClose: () => void;
};

export default function PositionTechStackDropdown({
  open,
  value,
  onChange,
  onApply,
  onReset,
  onClose,
}: PositionTechStackDropdownProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const selected = useMemo(() => new Set(value), [value]);

  const [activeTab, setActiveTab] = useState<'frontend' | 'backend' | 'infra'>('frontend');
  // 밑줄(전체 라인/활성 라인) 계산용 ref
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const tabsRowRef = useRef<HTMLDivElement | null>(null);
  const tabsAreaRef = useRef<HTMLDivElement | null>(null); // (active underline 기준)
  const frontendTabRef = useRef<HTMLButtonElement | null>(null);
  const backendTabRef = useRef<HTMLButtonElement | null>(null);
  const infraTabRef = useRef<HTMLButtonElement | null>(null);
  const [tabsTrack, setTabsTrack] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });
  const [tabUnderline, setTabUnderline] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  useEffect(() => {
    if (!open) return;

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
  }, [open, onClose]);

  const tabKeys =
    activeTab === 'frontend'
      ? [...FRONTEND_LANGUAGE_FRAMEWORK, ...FRONTEND_MOBILE].map((b) => b.key)
      : activeTab === 'backend'
        ? [...BACKEND_LANGUAGE, ...BACKEND_FRAMEWORK, ...BACKEND_DATABASE].map((b) => b.key)
        : [...INFRA_CLOUD, ...INFRA_CONTAINER].map((b) => b.key);

  // "전체 선택"은 드롭다운 내 모든 라벨을 ON/OFF (탭 변경해도 유지)
  const allKeys = Array.from(
    new Set(
      [
        ...FRONTEND_LANGUAGE_FRAMEWORK,
        ...FRONTEND_MOBILE,
        ...BACKEND_LANGUAGE,
        ...BACKEND_FRAMEWORK,
        ...BACKEND_DATABASE,
        ...INFRA_CLOUD,
        ...INFRA_CONTAINER,
      ].map((b) => b.key),
    ),
  );
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selected.has(k));

  const toggle = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(Array.from(next));
  };

  const toggleAll = () => {
    if (allKeys.length === 0) return;
    if (allSelected) {
      const next = value.filter((k) => allKeys.indexOf(k) === -1);
      onChange(next);
      return;
    }
    const next = new Set(value);
    for (const k of allKeys) next.add(k);
    onChange(Array.from(next));
  };

  const renderChip = (b: TechStackChip) => {
    const isOn = selected.has(b.key);

    // 이미지 에셋이 있는 경우(Off/On)
    if ('off' in b && 'on' in b) {
      return (
        <button
          key={b.key}
          type="button"
          onClick={() => toggle(b.key)}
          className="transition-transform duration-150 ease-out active:scale-[0.98]"
        >
          <img
            src={isOn ? b.on : b.off}
            alt={b.label}
            className="h-[36px] w-auto select-none"
            draggable={false}
          />
        </button>
      );
    }

    // 에셋이 아직 없는 항목은 동일 톤의 텍스트 칩으로 임시 처리
    return (
      <button
        key={b.key}
        type="button"
        onClick={() => toggle(b.key)}
        className={`inline-flex h-[36px] items-center gap-[8px] rounded-[24px] border px-[12px] py-[8px] text-left transition-transform duration-150 ease-out active:scale-[0.98] ${
          isOn
            ? 'border-[#4E49FF] bg-[var(--ui-100)]'
            : 'border-[var(--ui-200)] bg-[var(--ui-100)]'
        }`}
      >
        <span className="Caption1 font-medium text-[var(--ui-800)]">{b.label}</span>
      </button>
    );
  };

  // 탭별로 footer 위치를 올린 만큼 전체 높이도 조정
  const containerHeightClass =
    activeTab === 'backend' ? 'h-[480px]' : activeTab === 'infra' ? 'h-[340px]' : 'h-[397px]';
  const contentPaddingBottomClass =
    activeTab === 'infra' ? 'pb-[72px]' : activeTab === 'backend' ? 'pb-[80px]' : 'pb-[72px]';
  const footerBottomClass =
    activeTab === 'infra' ? 'bottom-0' : activeTab === 'backend' ? 'bottom-[8px]' : 'bottom-0';

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

    // 전체 밑줄은 탭 텍스트 영역보다 "아주 살짝"만 더 길게
    const trackExtra = 16; // px (좌/우 각각 8px)
    let trackLeft = rowRect.left - containerRect.left - trackExtra / 2;
    let trackWidth = rowRect.width + trackExtra;

    // 경계 보정(컨테이너 밖으로 나가지 않게)
    if (trackLeft < 0) {
      trackWidth += trackLeft;
      trackLeft = 0;
    }
    const trackMaxWidth = containerRect.width - trackLeft;
    if (trackWidth > trackMaxWidth) trackWidth = trackMaxWidth;

    // 활성 밑줄은 글자(버튼) 너비보다 살짝 더 길게
    const extra = 8; // px (좌/우 각각 4px)
    const areaLeft = containerRect.left + trackLeft;
    const areaWidth = trackWidth;

    let left = btnRect.left - areaLeft - extra / 2;
    let width = btnRect.width + extra;

    // 경계 보정(언더라인 컨테이너 밖으로 나가지 않게)
    if (left < 0) {
      width += left; // left가 -면 width를 줄임
      left = 0;
    }
    const maxWidth = areaWidth - left;
    if (width > maxWidth) width = maxWidth;

    // 인프라(마지막 탭) 선택 시 오른쪽 끝까지 밑줄이 닿게
    if (activeTab === 'infra') {
      width = areaWidth - left;
    }

    setTabsTrack({ left: trackLeft, width: trackWidth });
    setTabUnderline({ left, width });
  };

  useLayoutEffect(() => {
    if (!open) return;
    measureTabs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeTab]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => measureTabs();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeTab]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={`absolute left-0 top-[calc(100%+12px)] z-50 w-[358px] overflow-hidden rounded-[12px] bg-[var(--ui-50)] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.08)] ${containerHeightClass}`}
    >
      <div className="px-[16px] pt-[16px]">
        <p className="Label1 font-medium text-[var(--ui-600)]">포지션/기술스택</p>
      </div>

      {/* 탭 */}
      <div className="px-[16px] pt-[20px]">
        <div ref={tabsContainerRef} className="w-full">
          <div
            ref={tabsRowRef}
            className="flex w-fit items-center gap-[24px] text-[16px] font-semibold leading-[1.5] tracking-[0.0912px]"
          >
            <button
              ref={frontendTabRef}
              type="button"
              onClick={() => setActiveTab('frontend')}
              className={activeTab === 'frontend' ? 'text-[var(--ui-700)]' : 'text-[var(--ui-400)]'}
            >
              프론트엔드
            </button>
            <button
              ref={backendTabRef}
              type="button"
              onClick={() => setActiveTab('backend')}
              className={activeTab === 'backend' ? 'text-[var(--ui-700)]' : 'text-[var(--ui-400)]'}
            >
              백엔드
            </button>
            <button
              ref={infraTabRef}
              type="button"
              onClick={() => setActiveTab('infra')}
              className={activeTab === 'infra' ? 'text-[var(--ui-700)]' : 'text-[var(--ui-400)]'}
            >
              인프라
            </button>
          </div>

          {/* 탭 밑줄: 글자 너비만큼 */}
          <div className="relative mt-[8px] h-px w-full">
            <div
              ref={tabsAreaRef}
              className="absolute left-0 top-0 h-px rounded-[24px] bg-[var(--ui-100)]"
              style={{
                width: `${tabsTrack.width}px`,
                transform: `translateX(${tabsTrack.left}px)`,
              }}
            >
              <div
                className="absolute left-0 top-0 h-px rounded-[24px] bg-[var(--ui-300)] transition-[transform,width] duration-200 ease-out"
                style={{
                  width: `${tabUnderline.width}px`,
                  transform: `translateX(${tabUnderline.left}px)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 전체 선택 */}
      <div className="absolute right-[16px] top-[93px] flex items-center gap-[4px]">
        <button
          type="button"
          onClick={toggleAll}
          className="inline-flex items-center gap-[4px] text-[var(--ui-500)]"
        >
          <span aria-hidden className="inline-flex h-[20px] w-[20px] items-center justify-center">
            <SelectAllIcon aria-hidden className="h-[10px] w-[19px]" />
          </span>
          <span className="Label1 font-medium">전체 선택</span>
        </button>
      </div>

      {/* 내용 */}
      <div className={`mx-auto mt-[33px] w-[326px] ${contentPaddingBottomClass}`}>
        {activeTab === 'frontend' ? (
          <div className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[12px]">
              <p className="Label1 font-medium text-[var(--ui-700)]">언어/프레임워크</p>
              <div className="flex flex-wrap gap-[4px]">
                {FRONTEND_LANGUAGE_FRAMEWORK.map((b) => renderChip(b))}
              </div>
            </div>

            <div className="flex flex-col gap-[12px]">
              <p className="Label1 font-medium text-[var(--ui-700)]">모바일</p>
              <div className="flex w-[305px] flex-wrap gap-x-[4px] gap-y-[6px]">
                {FRONTEND_MOBILE.map((b) => renderChip(b))}
              </div>
            </div>
          </div>
        ) : activeTab === 'backend' ? (
          <div className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[12px]">
              <p className="Label1 font-medium text-[var(--ui-700)]">언어</p>
              <div className="flex flex-wrap gap-[4px]">{BACKEND_LANGUAGE.map((b) => renderChip(b))}</div>
            </div>
            <div className="flex flex-col gap-[12px]">
              <p className="Label1 font-medium text-[var(--ui-700)]">프레임워크</p>
              <div className="flex flex-wrap gap-[4px]">{BACKEND_FRAMEWORK.map((b) => renderChip(b))}</div>
            </div>
            <div className="flex flex-col gap-[12px]">
              <p className="Label1 font-medium text-[var(--ui-700)]">데이터베이스</p>
              <div className="flex flex-wrap gap-[4px]">{BACKEND_DATABASE.map((b) => renderChip(b))}</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[12px]">
              <p className="Label1 font-medium text-[var(--ui-700)]">클라우드</p>
              <div className="flex flex-wrap gap-[4px]">{INFRA_CLOUD.map((b) => renderChip(b))}</div>
            </div>
            <div className="flex flex-col gap-[12px]">
              <p className="Label1 font-medium text-[var(--ui-700)]">컨테이너</p>
              <div className="flex flex-wrap gap-[4px]">{INFRA_CONTAINER.map((b) => renderChip(b))}</div>
            </div>
          </div>
        )}
      </div>

      {/* footer (우하단 정렬) */}
      <div
        className={`absolute right-0 flex h-[52px] w-[220px] items-center justify-end gap-[12px] px-[16px] ${footerBottomClass}`}
      >
        <button
          type="button"
          onClick={() => {
            onReset?.();
            onChange([]);
          }}
          className="Label1 flex h-[36px] w-[60px] items-center justify-center rounded-[8px] bg-transparent px-[10px] text-[var(--ui-500)] hover:text-[var(--ui-700)]"
        >
          초기화
        </button>
        <button
          type="button"
          onClick={() => {
            onApply?.();
            onClose();
          }}
          className="Label1 flex h-[36px] w-[60px] items-center justify-center rounded-[8px] bg-[#4E49FF] px-[10px] text-white"
        >
          저장
        </button>
      </div>
    </div>
  );
}

