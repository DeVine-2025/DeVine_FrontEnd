import { useEffect, useMemo, useRef, useState } from 'react';
import UnderVectorIcon from '@assets/icons/create-project/under-vector.svg?react';

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectDropdownProps = {
  placeholder: string;
  value: string | null;
  onChange: (next: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
};

export default function SelectDropdown({
  placeholder,
  value,
  onChange,
  options,
  disabled,
  className,
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = useMemo(() => {
    if (!value) return null;
    return options.find((o) => o.value === value)?.label ?? null;
  }, [options, value]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (wrapRef.current && !wrapRef.current.contains(target)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={`relative w-full ${className ?? ''}`}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
        }}
        className={`relative flex h-[44px] w-full items-center rounded-[12px] border bg-ui-bg px-[12px] text-left transition-colors ${
          disabled ? 'cursor-not-allowed border-ui-200 opacity-60' : ''
        } ${open ? 'border-[#4E49FF]' : 'border-ui-200'}`}
      >
        {selectedLabel ? (
          <span className="Caption1 font-medium text-ui-900">{selectedLabel}</span>
        ) : (
          <span className="Caption1 text-ui-400">{placeholder}</span>
        )}

        <span className="absolute right-[10px] top-1/2 -translate-y-1/2 inline-flex h-[28px] w-[28px] items-center justify-center text-ui-400">
          <UnderVectorIcon
            aria-hidden
            className={`h-[9px] w-[16px] transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+10px)] z-50 w-full overflow-hidden rounded-[16px] border border-ui-200 bg-ui-bg shadow-[0px_12px_24px_0px_rgba(0,0,0,0.18)]"
        >
          <div className="max-h-[240px] overflow-auto py-[8px]">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  onClick={() => {
                    if (opt.disabled) return;
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className="group relative flex w-full items-center px-[16px] py-[12px] text-left disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span
                    aria-hidden
                    className={`absolute inset-x-[10px] inset-y-[4px] rounded-[12px] transition-colors ${
                      isSelected ? 'bg-ui-100' : 'bg-transparent group-hover:bg-ui-50'
                    }`}
                  />
                  <span className="Caption1 relative z-10 font-medium text-ui-900">
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

