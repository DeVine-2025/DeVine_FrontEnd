import CalendarClockIcon from '@assets/icons/calendar-clock.svg?react';
import { ko } from 'date-fns/locale';
import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import '@styles/date-picker-theme.css';

type AdminDateTimePickerProps = {
  value: Date;
  onChange: (value: Date) => void;
};

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const MINUTES = Array.from({ length: 6 }, (_, index) => index * 10);

const formatDateTime = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  const hour = String(value.getHours()).padStart(2, '0');
  const minute = String(value.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}`;
};

/** 관리자 점검 종료 시각을 날짜와 시간 단위로 고르는 버튼형 선택기입니다. */
export function AdminDateTimePicker({ value, onChange }: AdminDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('click', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('click', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const setDate = (date: Date | undefined) => {
    if (!date) return;

    const nextValue = new Date(date);
    nextValue.setHours(value.getHours(), value.getMinutes(), 0, 0);
    onChange(nextValue);
  };

  const setTime = (part: 'hour' | 'minute', nextPart: number) => {
    const nextValue = new Date(value);

    if (part === 'hour') nextValue.setHours(nextPart);
    else nextValue.setMinutes(nextPart);

    onChange(nextValue);
  };

  return (
    <div ref={containerRef} className="date-picker-popover relative">
      <button
        aria-label="예상 종료 시각 선택"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="Body1 flex h-[56px] w-full cursor-pointer items-center rounded-[8px] border border-[var(--ui-200)] bg-[var(--ui-bg)] pr-[16px] pl-[54px] text-left font-medium text-[var(--ui-800)] hover:bg-[var(--ui-50)] focus:border-[#4e49ff] focus:outline-none"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <CalendarClockIcon
          aria-hidden="true"
          className="[&_path]:!fill-current pointer-events-none absolute left-[16px] h-[22px] w-[22px] text-[var(--ui-600)]"
        />
        {formatDateTime(value)}
      </button>

      {isOpen && (
        <div
          aria-label="예상 종료 시각 선택"
          className="absolute right-0 bottom-full z-50 mb-[8px]"
          role="dialog"
        >
          <DayPicker
            captionLayout="dropdown"
            endMonth={new Date(2100, 11)}
            footer={
              <div className="mt-[12px] border-[var(--ui-200)] border-t pt-[16px]">
                <div className="flex gap-[8px]">
                  <label className="Caption1 flex-1 font-medium text-[var(--ui-600)]">
                    시간
                    <select
                      className="Caption1 mt-[6px] h-[36px] w-full cursor-pointer rounded-[8px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-[8px] text-[var(--ui-800)] outline-none focus:border-[#4e49ff]"
                      onChange={(event) => setTime('hour', Number(event.target.value))}
                      value={value.getHours()}
                    >
                      {HOURS.map((hour) => (
                        <option key={hour} value={hour}>
                          {String(hour).padStart(2, '0')}시
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="Caption1 flex-1 font-medium text-[var(--ui-600)]">
                    분
                    <select
                      className="Caption1 mt-[6px] h-[36px] w-full cursor-pointer rounded-[8px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-[8px] text-[var(--ui-800)] outline-none focus:border-[#4e49ff]"
                      onChange={(event) => setTime('minute', Number(event.target.value))}
                      value={value.getMinutes()}
                    >
                      {MINUTES.map((minute) => (
                        <option key={minute} value={minute}>
                          {String(minute).padStart(2, '0')}분
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <button
                  className="Caption1 mt-[16px] h-[38px] w-full cursor-pointer rounded-[8px] bg-[#4e49ff] font-semibold text-white transition-colors hover:bg-[#3e39e8]"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  완료
                </button>
              </div>
            }
            locale={ko}
            mode="single"
            onSelect={setDate}
            selected={value}
            startMonth={new Date(2020, 0)}
          />
        </div>
      )}
    </div>
  );
}
