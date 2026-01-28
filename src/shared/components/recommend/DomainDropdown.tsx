import { useEffect, useMemo, useRef } from 'react';

type DomainDropdownProps = {
  open: boolean;
  title?: string;
  value: string[];
  onChange: (next: string[]) => void;
  onApply?: () => void;
  onReset?: () => void;
  onClose: () => void;
};

const OPTIONS = [
  '전체',
  '헬스케어',
  '핀테크',
  '이커머스',
  '교육',
  '소셜/커뮤니티',
  '엔터테인먼트',
  'AI/데이터',
  '기타',
] as const;

function CheckIcon() {
  return (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
      <path
        d="M11 1L4.75 7L1 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DomainDropdown({
  open,
  title = '도메인',
  value,
  onChange,
  onApply,
  onReset,
  onClose,
}: DomainDropdownProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const realOptions = useMemo(
    () => OPTIONS.filter((o) => o !== '전체') as unknown as string[],
    [],
  );
  const selected = useMemo(() => new Set(value.filter((v) => v !== '전체')), [value]);

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

  if (!open) return null;

  const toggle = (opt: string) => {
    if (opt === '전체') {
      const allSelected = selected.size === realOptions.length;
      onChange(allSelected ? [] : [...realOptions]);
      return;
    }

    const next = new Set(selected);
    if (next.has(opt)) next.delete(opt);
    else next.add(opt);
    onChange(next.size === realOptions.length ? [...realOptions] : Array.from(next));
  };

  return (
    <div
      ref={ref}
      className="absolute left-0 top-[calc(100%+12px)] z-50 w-[440px] overflow-hidden rounded-[12px] border border-[var(--ui-100)] bg-[var(--ui-50)] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.08)]"
    >
      <div className="px-[16px] pb-[8px] pt-[16px]">
        <p className="Label1 font-medium text-[var(--ui-600)]">{title}</p>
      </div>

      <div className="grid grid-cols-2 gap-x-[0px] pb-[8px]">
        {OPTIONS.map((opt) => {
          const isChecked = opt === '전체' ? selected.size === realOptions.length : selected.has(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className="group relative flex w-full items-center gap-[12px] px-[16px] py-[8px] text-left"
            >
              <span
                aria-hidden
                className="absolute inset-x-[8px] inset-y-[2px] rounded-[12px] bg-[var(--ui-100)] opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100"
              />
              <span
                aria-hidden
                className={`relative z-10 inline-flex h-[20px] w-[20px] items-center justify-center rounded-[4px] border ${
                  isChecked
                    ? 'border-[#4E49FF] bg-[#4E49FF] text-white'
                    : 'border-[var(--ui-300)] bg-[var(--ui-bg)] text-transparent'
                }`}
              >
                <CheckIcon />
              </span>
              <span className="Caption1 relative z-10 font-medium text-[var(--ui-900)]">{opt}</span>
            </button>
          );
        })}
      </div>

      <div className="flex h-[52px] w-full items-center justify-end gap-[12px] px-[16px]">
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

