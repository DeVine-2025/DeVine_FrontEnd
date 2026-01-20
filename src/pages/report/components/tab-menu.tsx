import { cn } from '@libs/cn';

type TabMenuProps = {
  text: string;
  isActive: boolean;
  onClick: () => void;
}


const TabMenu = ({ text , isActive, onClick } : TabMenuProps) => {
  return (
    <div onClick={onClick} className={cn('box-content inline-block cursor-pointer rounded-[32px] px-[2.4rem] py-[1.2rem]', isActive ? "bg-[var(--ui-900)]" : "border-2 border-[var(--ui-200)]")}>
      <p className={cn("text-2xl", isActive ? "text-[var(--ui-bg)]" : "text-[var(--ui-400)]")}>{text}</p>
    </div>
  );
};

export default TabMenu;