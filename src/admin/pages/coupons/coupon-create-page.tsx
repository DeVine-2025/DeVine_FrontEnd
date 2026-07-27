import ArrowLeftAdminIcon from '@assets/icons/arrow-left-admin.svg?react';
import CalendarClockIcon from '@assets/icons/calendar-clock.svg?react';
import ChevronDownIcon from '@assets/icons/chevron-down.svg?react';
import { ko } from 'date-fns/locale';
import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { Link, useParams } from 'react-router-dom';
import { cn } from '@libs/cn';
import '@styles/date-picker-theme.css';
import { AdminPageTitle } from '../../components/common/admin-page-title';

const DISCOUNT_METHODS = ['정률', '정액'] as const;
const ISSUE_METHODS = ['전체', '특정유저', '전체생성'] as const;

type DiscountMethod = (typeof DISCOUNT_METHODS)[number];
type IssueMethod = (typeof ISSUE_METHODS)[number];

const FIELD_LABEL_CLASS = 'Headline1 font-semibold text-[var(--ui-1000)]';
const INPUT_CLASS =
  'Body1 h-[50px] w-full rounded-[5px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-[16px] font-medium text-[var(--ui-1000)] outline-none placeholder:text-[var(--ui-300)] focus:border-[#4e49ff]';

function formatDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date;
  onChange: (value: Date) => void;
}) {
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

  return (
    <div className="flex flex-col gap-[12px]">
      <span className={FIELD_LABEL_CLASS}>{label}</span>
      <div ref={containerRef} className="date-picker-popover relative">
        <button
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={label}
          className={cn(
            INPUT_CLASS,
            'flex cursor-pointer items-center pr-[16px] pl-[48px] text-left',
          )}
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <CalendarClockIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-[16px] size-[24px] -translate-y-1/2"
          />
          {formatDate(value)}
        </button>

        {isOpen && (
          <div
            aria-label={label}
            className="absolute top-full left-0 z-50 mt-[8px]"
            role="dialog"
          >
            <DayPicker
              captionLayout="dropdown"
              endMonth={new Date(2100, 11)}
              locale={ko}
              mode="single"
              onSelect={(date) => {
                if (!date) return;
                onChange(date);
                setIsOpen(false);
              }}
              selected={value}
              startMonth={new Date(2020, 0)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function CouponCreatePage() {
  const { couponId } = useParams();
  const isEdit = Boolean(couponId);

  const [name, setName] = useState('');
  const [product, setProduct] = useState('');
  const [discountMethod, setDiscountMethod] = useState<DiscountMethod>('정률');
  const [discountValue, setDiscountValue] = useState('');
  const [startDate, setStartDate] = useState(() => new Date(2026, 6, 21));
  const [endDate, setEndDate] = useState(() => new Date(2026, 6, 21));
  const [quantity, setQuantity] = useState('');
  const [issueMethod, setIssueMethod] = useState<IssueMethod>('전체');

  return (
    <section>
      <Link
        className="Body1 inline-flex cursor-pointer items-center gap-[6px] font-medium text-[1.5rem] text-[var(--ui-700)] no-underline hover:text-[var(--ui-1000)]"
        to="/admin/coupons"
      >
        <ArrowLeftAdminIcon
          aria-hidden="true"
          className="[&_path]:!fill-current size-[20px] shrink-0"
        />
        쿠폰 목록/ 현황으로
      </Link>

      <AdminPageTitle className="mt-[8px]" title="쿠폰 생성 / 발급" />

      <div className="mt-[28px] rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-bg)] p-[35px]">
        <div className="grid grid-cols-1 gap-x-[40px] gap-y-[36px] lg:grid-cols-2">
          <label className="flex flex-col gap-[12px]">
            <span className={FIELD_LABEL_CLASS}>쿠폰명 / 캠페인명</span>
            <input
              className={INPUT_CLASS}
              onChange={(event) => setName(event.target.value)}
              placeholder="내용 입력"
              value={name}
            />
          </label>

          <label className="flex flex-col gap-[12px]">
            <span className={FIELD_LABEL_CLASS}>적용 대상 상품</span>
            <input
              className={INPUT_CLASS}
              onChange={(event) => setProduct(event.target.value)}
              placeholder="상품을 입력해주세요"
              value={product}
            />
          </label>

          <label className="flex flex-col gap-[12px]">
            <span className={FIELD_LABEL_CLASS}>할인 방식</span>
            <span className="relative block">
              <select
                className={cn(INPUT_CLASS, 'cursor-pointer appearance-none pr-[40px]')}
                onChange={(event) => setDiscountMethod(event.target.value as DiscountMethod)}
                value={discountMethod}
              >
                {DISCOUNT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-[16px] h-[8px] w-[14px] -translate-y-1/2 [&_path]:stroke-[var(--ui-400)]"
              />
            </span>
          </label>

          <label className="flex flex-col gap-[12px]">
            <span className={FIELD_LABEL_CLASS}>할인 값</span>
            <input
              className={INPUT_CLASS}
              onChange={(event) => setDiscountValue(event.target.value)}
              placeholder="할인 값을 입력해주세요"
              value={discountValue}
            />
          </label>

          <DateField label="유효기간 시작일" onChange={setStartDate} value={startDate} />
          <DateField label="유효기간 종료일" onChange={setEndDate} value={endDate} />

          <label className="flex flex-col gap-[12px]">
            <span className={FIELD_LABEL_CLASS}>발급 수량 제한</span>
            <input
              className={INPUT_CLASS}
              inputMode="numeric"
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="수량을 입력해주세요"
              value={quantity}
            />
          </label>

          <div className="flex flex-col gap-[12px]">
            <span className={FIELD_LABEL_CLASS}>발급 방식</span>
            <div className="flex overflow-hidden rounded-[5px] border border-[var(--ui-200)]">
              {ISSUE_METHODS.map((method, index) => {
                const isSelected = method === issueMethod;

                return (
                  <button
                    className={cn(
                      'Body1 h-[50px] flex-1 cursor-pointer font-medium transition-colors',
                      index > 0 && 'border-[var(--ui-200)] border-l',
                      isSelected
                        ? 'bg-[#4e49ff] text-white'
                        : 'bg-[var(--ui-bg)] text-[var(--ui-800)] hover:bg-[var(--ui-50)]',
                    )}
                    key={method}
                    onClick={() => setIssueMethod(method)}
                    type="button"
                  >
                    {method}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          className="Heading2 mt-[36px] h-[56px] w-full cursor-pointer rounded-[12px] bg-[#4e49ff] font-medium text-white transition-colors hover:bg-[#3e39e8]"
          type="button"
        >
          {isEdit ? '쿠폰 수정' : '쿠폰 발급'}
        </button>
      </div>
    </section>
  );
}
