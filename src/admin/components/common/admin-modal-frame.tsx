import type { ReactNode } from 'react';
import { cn } from '@libs/cn';
const sizes = {
  notice: 'max-h-[90vh] max-w-[680px] overflow-y-auto lg:max-2xl:max-w-[620px]',
  coupon: 'max-h-[90vh] max-w-[640px] overflow-y-auto lg:max-2xl:max-w-[580px]',
  member: 'max-w-[480px] text-center lg:max-2xl:max-w-[440px] lg:max-2xl:overflow-y-auto',
};
type Props = {
  label: string;
  size: keyof typeof sizes;
  busy: boolean;
  onClose: () => void;
  children: ReactNode;
};
export default function AdminModalFrame({ label, size, busy, onClose, children }: Props) {
  return (
    <div
      aria-label={label}
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-[20px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        className={cn(
          'w-full rounded-[16px] bg-[var(--ui-bg)] p-[28px] shadow-xl lg:max-2xl:max-h-[88svh] lg:max-2xl:p-[22px]',
          sizes[size],
        )}
      >
        {children}
      </div>
    </div>
  );
}
