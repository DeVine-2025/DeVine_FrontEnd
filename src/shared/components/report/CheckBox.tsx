import CheckboxCheckedIcon from '@assets/icons/checkbox-checked.svg?react';
import CheckboxUncheckedIcon from '@assets/icons/checkbox-unchecked.svg?react';
import InformationIcon from '@assets/icons/information.svg?react';
import { cn } from '@libs/cn';

type CheckboxProps = {
  title: string;
  description: string;
  isExist?: boolean;
  isActive?: boolean;
  onClick?: () => void;
};

const CheckBox = ({ title, description, isExist, isActive, onClick }: CheckboxProps) => {

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-[1.2rem] rounded-[16px] border px-[1.6rem] py-[1.4rem] text-left transition-all duration-200',
        isActive
          ? 'border-[rgba(102,84,245,0.5)] bg-[rgba(102,84,245,0.1)]'
          : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.05]',
      )}
      aria-pressed={isActive}
    >
      <span className="mt-[0.15rem] inline-flex h-9 w-9 shrink-0 items-center justify-center">
        {isActive ? (
          <CheckboxCheckedIcon className="h-9 w-9" aria-hidden />
        ) : (
          <CheckboxUncheckedIcon className="h-9 w-9" aria-hidden />
        )}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-[0.5rem]">
        {isExist ? (
          <div className="flex items-center gap-[0.4rem]">
            <InformationIcon />
            <span
              className={cn(
                'text-[11px] font-semibold',
                'text-[var(--badge-text-primary)]',
              )}
            >
              이미 생성된 리포트가 있어요
            </span>
          </div>
        ) : null}
        <p
          className={cn(
            'truncate text-[1.5rem] font-semibold leading-snug',
            isActive
              ? 'text-[rgba(140,136,255,1)]'
              : 'text-white/90',
          )}
        >
          {title}
        </p>
        {description ? (
          <p
            className={cn(
              'line-clamp-1 text-[1.3rem]',
              'text-white/35',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
    </button>
  );
};

export default CheckBox;
