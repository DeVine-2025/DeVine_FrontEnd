type LoadingProps = {
  className?: string;
}

const Loading = ({ className }: LoadingProps) => {
  return (
    <div className="flex items-center justify-center w-full h-full overflow-hidden">
      <span role="status" aria-label="불러오는 중" className={`block h-10 w-10 animate-spin rounded-full border-4 border-[var(--surface-badge)] border-t-[var(--color-primary)] motion-reduce:animate-none ${className ?? ""}`} />
    </div>
  );
};

export default Loading;
