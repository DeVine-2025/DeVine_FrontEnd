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
    <div className="flex gap-[1.6rem] rounded-xl p-[1.2rem] transition-colors duration-200 hover:bg-[var(--ui-50)]">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg"
        aria-pressed={isActive}
      >
        {isActive ? (
          <CheckboxCheckedIcon className="h-9 w-9" aria-hidden />
        ) : (
          <CheckboxUncheckedIcon className="h-9 w-9" aria-hidden />
        )}
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
