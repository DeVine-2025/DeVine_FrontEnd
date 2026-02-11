type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClass = {
  sm: 'h-8 w-8 border-[3px]',
  md: 'h-10 w-10 border-4',
  lg: 'h-20 w-20 border-4',
} as const;

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div
      className={`shrink-0 rounded-full border-[var(--ui-200)] border-t-[var(--color-primary)] animate-spin ${sizeClass[size]} ${className ?? ''}`}
      aria-hidden
    />
  );
}
