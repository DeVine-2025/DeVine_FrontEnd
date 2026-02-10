import SelectAllIcon from '@assets/icons/select-all.svg?react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useThemeStore } from '@store/theme';

import {
  BACKEND_DATABASE,
  BACKEND_FRAMEWORK,
  BACKEND_LANGUAGE,
  FRONTEND_LANGUAGE_FRAMEWORK,
  FRONTEND_MOBILE,
  INFRA_CLOUD,
  INFRA_CONTAINER,
  getKeysByPosition,
  type PositionKey,
  type TechStackChip,
} from '@constants/position-tech-stack';

type Props = {
  open: boolean;
  position: PositionKey;
  value: string[];
  onChange: (next: string[]) => void;
  onClose: () => void;
  onReset?: () => void;
  onApply?: () => void;
};

export default function PositionBasedTechStackDropdown({
  open,
  position,
  value,
  onChange,
  onClose,
  onReset,
  onApply,
}: Props) {
  const { theme } = useThemeStore();
  const ref = useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState<string[]>([]);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const selected = useMemo(() => new Set(draft), [draft]);

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

  const keys = useMemo(() => getKeysByPosition(position), [position]);
  const allSelected = keys.length > 0 && keys.every((k) => selected.has(k));

  const toggle = (key: string) => {
    const next = new Set(draft);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setDraft(Array.from(next));
  };

  const toggleAll = () => {
    if (keys.length === 0) return;
    if (allSelected) {
      setDraft(draft.filter((k) => keys.indexOf(k) === -1));
      return;
    }
    const next = new Set(draft);
    for (const k of keys) next.add(k);
    setDraft(Array.from(next));
  };

  const renderChip = (b: TechStackChip) => {
    const isOn = selected.has(b.key);
    if ('off' in b && 'on' in b) {
      const offSrc = theme === 'dark' ? (b.offDark ?? b.off) : b.off;
      const onSrc = theme === 'dark' ? (b.onDark ?? b.on) : b.on;
      return (
        <button
          key={b.key}
          type="button"
          onClick={() => toggle(b.key)}
          className="transition-transform duration-150 ease-out active:scale-[0.98]"
        >
          <img src={isOn ? onSrc : offSrc} alt={b.label} className="h-[36px] w-auto select-none" draggable={false} />
        </button>
      );
    }
    return (
      <button
        key={b.key}
        type="button"
        onClick={() => toggle(b.key)}
        className={`inline-flex h-[36px] items-center gap-[8px] rounded-[24px] border px-[12px] py-[8px] text-left transition-transform duration-150 ease-out active:scale-[0.98] ${
          isOn ? 'border-[#4E49FF] bg-ui-100' : 'border-ui-200 bg-ui-100'
        }`}
      >
        <span className="Caption1 font-medium text-ui-800">{b.label}</span>
      </button>
    );
  };

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute left-0 top-[calc(100%+12px)] z-50 w-[358px] overflow-hidden rounded-[16px] border border-ui-200 bg-ui-bg shadow-[0px_12px_24px_0px_rgba(0,0,0,0.12)]"
    >
      <div className="px-[16px] pt-[16px]" />

      {/* 전체 선택 */}
      <div className="absolute right-[16px] top-[16px] flex items-center gap-[4px]">
        <button type="button" onClick={toggleAll} className="inline-flex items-center gap-[4px] text-ui-500">
          <span aria-hidden className="inline-flex h-[20px] w-[20px] items-center justify-center">
            <SelectAllIcon aria-hidden className="h-[10px] w-[19px]" />
          </span>
          <span className="Label1 font-medium">전체 선택</span>
        </button>
      </div>

      <div className="mx-auto mt-[20px] w-[326px] pb-[72px]">
        {position === 'frontend' ? (
          <div className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[12px]">
              <p className="Label1 font-medium text-ui-700">언어/프레임워크</p>
              <div className="flex flex-wrap gap-[4px]">{FRONTEND_LANGUAGE_FRAMEWORK.map((b) => renderChip(b))}</div>
            </div>
            <div className="flex flex-col gap-[12px]">
              <p className="Label1 font-medium text-ui-700">모바일</p>
              <div className="flex w-[305px] flex-wrap gap-x-[4px] gap-y-[6px]">
                {FRONTEND_MOBILE.map((b) => renderChip(b))}
              </div>
            </div>
          </div>
        ) : position === 'backend' ? (
          <div className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[12px]">
              <p className="Label1 font-medium text-ui-700">언어</p>
              <div className="flex flex-wrap gap-[4px]">{BACKEND_LANGUAGE.map((b) => renderChip(b))}</div>
            </div>
            <div className="flex flex-col gap-[12px]">
              <p className="Label1 font-medium text-ui-700">프레임워크</p>
              <div className="flex flex-wrap gap-[4px]">{BACKEND_FRAMEWORK.map((b) => renderChip(b))}</div>
            </div>
            <div className="flex flex-col gap-[12px]">
              <p className="Label1 font-medium text-ui-700">데이터베이스</p>
              <div className="flex flex-wrap gap-[4px]">{BACKEND_DATABASE.map((b) => renderChip(b))}</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[12px]">
              <p className="Label1 font-medium text-ui-700">클라우드</p>
              <div className="flex flex-wrap gap-[4px]">{INFRA_CLOUD.map((b) => renderChip(b))}</div>
            </div>
            <div className="flex flex-col gap-[12px]">
              <p className="Label1 font-medium text-ui-700">컨테이너</p>
              <div className="flex flex-wrap gap-[4px]">{INFRA_CONTAINER.map((b) => renderChip(b))}</div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 right-0 flex h-[52px] w-[220px] items-center justify-end gap-[12px] px-[16px]">
        <button
          type="button"
          onClick={() => {
            onReset?.();
            setDraft([]);
          }}
          className="Label1 flex h-[36px] w-[60px] items-center justify-center rounded-[8px] bg-ui-50 px-[10px] text-ui-500 hover:bg-ui-100 hover:text-ui-700"
        >
          초기화
        </button>
        <button
          type="button"
          onClick={() => {
            onChange(draft);
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

