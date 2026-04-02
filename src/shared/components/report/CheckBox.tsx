import CheckIcon from '@assets/icons/check.svg?react';
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
    <div className={cn('flex gap-[1.6rem] p-[1.2rem]', isExist && 'rounded-xl bg-[var(--ui-50)]')}>
      <button
        disabled={isExist}
        type="button"
        onClick={onClick}
        className={cn(
          'inline-block h-9 w-9 flex-row-center cursor-pointer rounded-lg',
          isActive ? 'bg-primary' : 'bg-[var(--ui-100)]',
        )}
      >
        <CheckIcon />
      </button>
      <div className="flex-col gap-[0.4rem]">
        {isExist && (
          <div className="flex items-center gap-[0.4rem]">
            <InformationIcon />
            <p className="Caption1 text-[var(--badge-text-primary)]">이미 생성된 리포트가 있어요</p>
          </div>
        )}
        <p className="text-3xl text-[var(--ui-900)]">{title}</p>
        <p className="text-2xl text-[var(--ui-600)]">{description}</p>
      </div>
    </div>
  );
};

export default CheckBox;
