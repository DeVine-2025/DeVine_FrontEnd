import { ko } from 'date-fns/locale';
import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';

import '@styles/date-picker-theme.css';

function toDate(str: string): Date | undefined {
  if (!str.trim()) return undefined;
  const d = new Date(str.replace(/\./g, '-'));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function toYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface DatePickerPopoverProps {
  value: string;
  onChange: (next: string) => void;
  min?: string;
  placeholder?: string;
  inputClassName?: string;
  error?: boolean;
}

const defaultInputClass =
  'Caption1 h-[48px] w-full rounded-[12px] border border-[var(--ui-200)] bg-[var(--ui-50)] px-[12px] pr-10 font-medium text-[var(--ui-900)] tracking-[0.0912px] transition-colors placeholder:text-[var(--ui-400)] focus:border-[#4E49FF] focus:outline-none';

export default function DatePickerPopover({
  value,
  onChange,
  min,
  placeholder = '연도-월-일',
  inputClassName,
  error,
}: DatePickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = toDate(value);
  const minDate = min ? toDate(min) : undefined;

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      onChange(date ? toYYYYMMDD(date) : '');
      setOpen(false);
    },
    [onChange],
  );

  const setToday = useCallback(() => {
    onChange(toYYYYMMDD(new Date()));
    setOpen(false);
  }, [onChange]);

  const clear = useCallback(() => {
    onChange('');
    setOpen(false);
  }, [onChange]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  const displayValue = value ? value.replace(/-/g, '.') : '';

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    if (!v) {
      onChange('');
      return;
    }
    const normalized = v.replace(/\./g, '-');
    const d = new Date(normalized);
    if (!Number.isNaN(d.getTime())) onChange(toYYYYMMDD(d));
  };

  return (
    <div ref={containerRef} className="date-picker-popover relative w-full">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          readOnly={false}
          className={
            inputClassName ??
            (error
              ? `${defaultInputClass} !border-form-error focus:!border-[#4E49FF]`
              : defaultInputClass)
          }
        />
        <button
          type="button"
          aria-label="캘린더 열기"
          onClick={() => setOpen((o) => !o)}
          className="-translate-y-1/2 absolute top-1/2 right-6 text-[var(--ui-500)] hover:text-[var(--ui-700)]"
        >
          <CalendarIcon />
        </button>
      </div>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-2">
          <DayPicker
            mode="single"
            locale={ko}
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={minDate ? { before: minDate } : undefined}
            defaultMonth={selectedDate ?? minDate ?? new Date()}
            formatters={{
              formatCaption: (date) =>
                `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월`,
            }}
            components={{
              Footer: () => (
                <div className="mt-3 flex justify-between border-[var(--ui-200)] border-t pt-3">
                  <button
                    type="button"
                    onClick={clear}
                    className="Caption1 text-primary hover:underline"
                  >
                    삭제
                  </button>
                  <button
                    type="button"
                    onClick={setToday}
                    className="Caption1 text-primary hover:underline"
                  >
                    오늘
                  </button>
                </div>
              ),
            }}
          />
        </div>
      )}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
