type AdminPageTitleProps = {
  title: string;
  description?: string;
  className?: string;
};

/** 관리자 최상위 화면에서 공통으로 사용하는 제목 영역입니다. */
export function AdminPageTitle({ title, description, className }: AdminPageTitleProps) {
  return (
    <div className={className}>
      <h1 className="Title3 font-bold text-[var(--ui-1000)]">{title}</h1>
      {description && (
        <p className="Heading2 mt-[3px] font-medium text-[var(--ui-600)]">{description}</p>
      )}
    </div>
  );
}
