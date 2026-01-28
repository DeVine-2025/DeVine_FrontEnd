import CheckIcon from "@assets/icons/check.svg?react";
import { cn } from '@libs/cn';
import InformationIcon from "@assets/icons/information.svg?react";

type CheckboxProps = {
  title: string;
  description: string;
  isExist?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

const Checkbox = ({title, description, isExist, isActive, onClick}: CheckboxProps) => {
  return (
    <div className={cn('flex gap-[1.6rem] p-[1.2rem]', isExist && "bg-[var(--ui-50)] rounded-xl")}>
      <button
        type="button"
        onClick={onClick}
        className={cn('w-[2.8rem] h-[2.8rem] cursor-pointer rounded-lg inline-block flex-row-center',
        isActive ? "bg-primary" : "bg-[var(--ui-100)]")}>
        <CheckIcon />
      </button>
      <div className="flex-col gap-[0.4rem]">
        {isExist && <div className="flex gap-[0.4rem] items-center">
          <InformationIcon />
          <p className="text-[var(--badge-text-primary)] Caption1">이미 생성된 리포트가 있어요</p>
        </div>}
        <p className="Heading2 text-[var(--ui-900)]">{title}</p>
        <p className="Body1 text-[var(--ui-600)]">{description}</p>
      </div>
    </div>
  );
};

export default Checkbox;