import ChevronDownIcon from '@assets/icons/chevron-down.svg?react';
import { cn } from '@libs/cn';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type AdminFilterButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  /** false면 쉐브론을 숨깁니다. 드롭다운이 아닌 필터 칩에 사용합니다. */
  showChevron?: boolean;
};

/** 목록 상단에서 쓰는 필터 칩(드롭다운 트리거)입니다. */
export function AdminFilterButton({
  children,
  className,
  showChevron = true,
  type = 'button',
  ...props
}: AdminFilterButtonProps) {
  return (
    <button
      className={cn(
        'Body1 inline-flex h-[48px] cursor-pointer items-center justify-center gap-[8px] rounded-full bg-[var(--ui-50)] px-[16px] font-medium text-[var(--ui-700)] hover:bg-[var(--ui-100)] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      type={type}
      {...props}
    >
      {children}
      {showChevron && (
        <ChevronDownIcon aria-hidden="true" className="admin-filter-chevron shrink-0" />
      )}
    </button>
  );
}
