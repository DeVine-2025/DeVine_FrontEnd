import { cn } from '@libs/cn';
import type { HTMLAttributes, ReactNode } from 'react';

type AdminFilterBarProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

/** 필터 칩을 가로로 나열하는 컨테이너입니다. 필요 없는 페이지에서는 생략하면 됩니다. */
export function AdminFilterBar({ children, className, ...props }: AdminFilterBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-[16px]', className)} {...props}>
      {children}
    </div>
  );
}
