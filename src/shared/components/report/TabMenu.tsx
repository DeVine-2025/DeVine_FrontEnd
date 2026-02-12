import { cn } from '@libs/cn';

type TabMenuProps = {
  text: string;
  isActive: boolean;
  onClick: () => void;
};

const TabMenu = ({ text, isActive, onClick }: TabMenuProps) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded-[32px] border-2 px-6 py-3',
        isActive ? 'border-transparent bg-[var(--ui-900)]' : 'border-[var(--ui-200)]',
      )}
    >
      <p className={cn('text-xl', isActive ? 'text-[var(--ui-bg)]' : 'text-[var(--ui-400)]')}>
        {text}
      </p>
    </button>
  );
};

export default TabMenu;
