import ArrowLeftAdminIcon from '@assets/icons/arrow-left-admin.svg?react';
import CalendarClockIcon from '@assets/icons/calendar-clock.svg?react';
import ChevronDownIcon from '@assets/icons/chevron-down.svg?react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ko } from 'date-fns/locale';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { cn } from '@libs/cn';
import '@styles/date-picker-theme.css';
import {
  createAdminCoupon,
  type CreateAdminCouponRequest,
  getAdminCoupon,
  type UpdateAdminCouponRequest,
  updateAdminCoupon,
} from '../../apis/coupon';
import { CouponIssueModal } from '../../components/coupon-issue-modal';
import { AdminPageTitle } from '../../components/common/admin-page-title';

const DISCOUNT_METHODS = ['정률', '정액'] as const;
const DISCOUNT_TYPE_BY_METHOD = {
  정률: 'FIXED_RATE',
  정액: 'FIXED_AMOUNT',
} as const;

type DiscountMethod = (typeof DISCOUNT_METHODS)[number];

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
  const parsedCouponId = Number(couponId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [productId, setProductId] = useState('');
  const [discountMethod, setDiscountMethod] = useState<DiscountMethod>('정률');
  const [discountValue, setDiscountValue] = useState('');
  const [startDate, setStartDate] = useState(() => new Date());
  const [endDate, setEndDate] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth;
  });
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState('');
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  const couponDetailQuery = useQuery({
    queryKey: ['admin', 'coupons', 'detail', parsedCouponId],
    queryFn: () => getAdminCoupon(parsedCouponId),
    enabled: isEdit && Number.isInteger(parsedCouponId) && parsedCouponId > 0,
  });

  useEffect(() => {
    const coupon = couponDetailQuery.data;
    if (!coupon) return;

    setName(coupon.name);
    setProductId(coupon.applicableTicketProductId?.toString() ?? '');
    setDiscountMethod(coupon.discountType === 'FIXED_AMOUNT' ? '정액' : '정률');
    setDiscountValue(coupon.discountValue.toString());
    setStartDate(new Date(coupon.validFrom));
    setEndDate(new Date(coupon.validUntil));
    setQuantity(coupon.totalIssueLimit?.toString() ?? '');
    setDescription(coupon.description ?? '');
    setIsActive(coupon.isActive);
  }, [couponDetailQuery.data]);

  const createCouponMutation = useMutation({
    mutationFn: createAdminCoupon,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      navigate('/admin/coupons');
    },
    onError: (error) => {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      setFormError(message ?? '쿠폰을 생성하지 못했습니다.');
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: ({
      couponId: targetCouponId,
      body,
    }: {
      couponId: number;
      body: UpdateAdminCouponRequest;
    }) => updateAdminCoupon(targetCouponId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      navigate('/admin/coupons');
    },
    onError: (error) => {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      setFormError(message ?? '쿠폰을 수정하지 못했습니다.');
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    const parsedProductId = Number(productId);
    const parsedDiscountValue = Number(discountValue);
    const parsedQuantity = Number(quantity);

    if (!name.trim()) {
      setFormError('쿠폰명을 입력해주세요.');
      return;
    }
    if (!isEdit && (!Number.isInteger(parsedProductId) || parsedProductId <= 0)) {
      setFormError('적용 대상 상품 ID를 올바르게 입력해주세요.');
      return;
    }
    if (!isEdit && (!Number.isFinite(parsedDiscountValue) || parsedDiscountValue <= 0)) {
      setFormError('할인 값을 올바르게 입력해주세요.');
      return;
    }
    if (!isEdit && discountMethod === '정률' && parsedDiscountValue > 100) {
      setFormError('정률 할인 값은 100 이하로 입력해주세요.');
      return;
    }
    if (
      (!isEdit || quantity.trim() !== '') &&
      (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0)
    ) {
      setFormError('발급 수량 제한을 올바르게 입력해주세요.');
      return;
    }
    if (startDate > endDate) {
      setFormError('유효기간 종료일은 시작일보다 빠를 수 없습니다.');
      return;
    }

    const validFrom = new Date(startDate);
    validFrom.setHours(0, 0, 0, 0);
    const validUntil = new Date(endDate);
    validUntil.setHours(23, 59, 59, 999);

    if (isEdit) {
      const body: UpdateAdminCouponRequest = {
        name: name.trim(),
        validFrom: validFrom.toISOString(),
        validUntil: validUntil.toISOString(),
        totalIssueLimit: quantity.trim() ? parsedQuantity : null,
        clearTotalIssueLimit: quantity.trim() === '',
        isActive,
        description: description.trim(),
      };

      updateCouponMutation.mutate({ couponId: parsedCouponId, body });
      return;
    }

    const body: CreateAdminCouponRequest = {
      name: name.trim(),
      discountType: DISCOUNT_TYPE_BY_METHOD[discountMethod],
      discountValue: parsedDiscountValue,
      applicableTicketProductId: parsedProductId,
      validFrom: validFrom.toISOString(),
      validUntil: validUntil.toISOString(),
      totalIssueLimit: parsedQuantity,
      description: description.trim(),
    };

    createCouponMutation.mutate(body);
  };

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

      <div className="mt-[8px] flex flex-wrap items-center justify-between gap-[16px]">
        <AdminPageTitle title={isEdit ? '쿠폰 수정' : '쿠폰 생성'} />
        {isEdit && couponDetailQuery.data && (
          <button
            className="Body1 inline-flex h-[44px] cursor-pointer items-center justify-center rounded-[8px] bg-[#4e49ff] px-[18px] font-medium text-white transition-colors hover:bg-[#3e39e8] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!couponDetailQuery.data.isActive}
            onClick={() => setIsIssueModalOpen(true)}
            type="button"
          >
            쿠폰 발급
          </button>
        )}
      </div>

      {isEdit && couponDetailQuery.isPending && (
        <p className="Body1 mt-[28px] text-center text-[var(--ui-500)]">
          쿠폰 정보를 불러오는 중입니다.
        </p>
      )}
      {isEdit && couponDetailQuery.isError && (
        <p className="Body1 mt-[28px] text-center text-[var(--negative-text)]">
          쿠폰 정보를 불러오지 못했습니다.
        </p>
      )}

      <form
        className={cn(
          'mt-[28px] rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-bg)] p-[35px]',
          isEdit &&
            (couponDetailQuery.isPending || couponDetailQuery.isError) &&
            'pointer-events-none opacity-60',
        )}
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 gap-x-[40px] gap-y-[36px] lg:grid-cols-2">
          <label className="flex flex-col gap-[12px]">
            <span className={FIELD_LABEL_CLASS}>쿠폰명 / 캠페인명</span>
            <input
              className={INPUT_CLASS}
              onChange={(event) => setName(event.target.value)}
              placeholder="내용 입력"
              required
              value={name}
            />
          </label>

          <label className="flex flex-col gap-[12px]">
            <span className={FIELD_LABEL_CLASS}>적용 대상 상품 ID</span>
            <input
              className={cn(INPUT_CLASS, isEdit && 'cursor-not-allowed bg-[var(--ui-100)]')}
              disabled={isEdit}
              inputMode="numeric"
              min="1"
              onChange={(event) => setProductId(event.target.value)}
              placeholder="상품 ID를 입력해주세요"
              required
              type="number"
              value={productId}
            />
          </label>

          <label className="flex flex-col gap-[12px]">
            <span className={FIELD_LABEL_CLASS}>할인 방식</span>
            <span className="relative block">
              <select
                className={cn(
                  INPUT_CLASS,
                  'cursor-pointer appearance-none pr-[40px]',
                  isEdit && 'cursor-not-allowed bg-[var(--ui-100)]',
                )}
                disabled={isEdit}
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
              className={cn(INPUT_CLASS, isEdit && 'cursor-not-allowed bg-[var(--ui-100)]')}
              disabled={isEdit}
              min="1"
              onChange={(event) => setDiscountValue(event.target.value)}
              placeholder="할인 값을 입력해주세요"
              required
              type="number"
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
              min="1"
              onChange={(event) => setQuantity(event.target.value)}
              placeholder={isEdit ? '비우면 발급 제한 없음' : '수량을 입력해주세요'}
              required={!isEdit}
              type="number"
              value={quantity}
            />
          </label>

          {isEdit && (
            <label className="flex flex-col gap-[12px]">
              <span className={FIELD_LABEL_CLASS}>활성화 여부</span>
              <span className="relative block">
                <select
                  className={cn(INPUT_CLASS, 'cursor-pointer appearance-none pr-[40px]')}
                  onChange={(event) => setIsActive(event.target.value === 'true')}
                  value={String(isActive)}
                >
                  <option value="true">활성</option>
                  <option value="false">비활성</option>
                </select>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-[16px] h-[8px] w-[14px] -translate-y-1/2 [&_path]:stroke-[var(--ui-400)]"
                />
              </span>
            </label>
          )}

          <label className="flex flex-col gap-[12px] lg:col-span-2">
            <span className={FIELD_LABEL_CLASS}>설명</span>
            <textarea
              className={cn(INPUT_CLASS, 'h-[100px] resize-none py-[14px]')}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="쿠폰 설명을 입력해주세요"
              value={description}
            />
          </label>
        </div>

        {formError && (
          <p className="Body1 mt-[24px] text-center font-medium text-[var(--negative-text)]">
            {formError}
          </p>
        )}

        <button
          className="Heading2 mt-[36px] h-[56px] w-full cursor-pointer rounded-[12px] bg-[#4e49ff] font-medium text-white transition-colors hover:bg-[#3e39e8] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={
            createCouponMutation.isPending ||
            updateCouponMutation.isPending ||
            (isEdit && (couponDetailQuery.isPending || couponDetailQuery.isError))
          }
          type="submit"
        >
          {isEdit
            ? updateCouponMutation.isPending
              ? '수정 중...'
              : '쿠폰 수정'
            : createCouponMutation.isPending
              ? '생성 중...'
              : '쿠폰 생성'}
        </button>
      </form>

      {isIssueModalOpen && couponDetailQuery.data && (
        <CouponIssueModal
          couponId={parsedCouponId}
          couponName={couponDetailQuery.data.name}
          onClose={() => setIsIssueModalOpen(false)}
        />
      )}
    </section>
  );
}
