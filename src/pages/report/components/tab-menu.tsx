import { cn } from '@libs/cn';

type TabMenuProps = {
  text: string;
  isActive: boolean;
  onClick: () => void;
}


const TabMenu = ({ text , isActive, onClick } : TabMenuProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center cursor-pointer rounded-[32px] px-[2.4rem] py-[1.2rem] border-2',
        isActive
          ? 'bg-[var(--ui-900)] border-transparent'
          : 'border-[var(--ui-200)]'
      )}
    >
      <p className={cn("Headline1", isActive ? "text-[var(--ui-bg)]" : "text-[var(--ui-400)]")}>{text}</p>
    </div>
  );
};

export default TabMenu;