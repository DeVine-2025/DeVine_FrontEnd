import { cn } from '@libs/cn';
import type { HTMLAttributes } from 'react';

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export default function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'ui-skeleton rounded-md',
        className,
      )}
      aria-hidden
      {...props}
    />
  );
}
