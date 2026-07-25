import { cn } from '@libs/cn';
import type { ReactNode } from 'react';

type AdminHighlightCardProps = {
  children: ReactNode;
  className?: string;
};

/**
 * 관리자 대시보드 지표와 시스템 상태 영역에서 사용하는 강조 테두리 카드입니다.
 */
export function AdminHighlightCard({ children, className }: AdminHighlightCardProps) {
  return (
    <div
      className={cn(
        'rounded-[11px] border border-transparent bg-[linear-gradient(var(--ui-bg),var(--ui-bg)),linear-gradient(180deg,rgba(135,157,255,0.65)_0%,rgba(165,139,255,0.4)_50%,rgba(255,159,212,0.6)_100%)] [background-clip:padding-box,border-box] [background-origin:border-box]',
        className,
      )}
    >
      {children}
    </div>
  );
}
