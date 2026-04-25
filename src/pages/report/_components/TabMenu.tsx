import { cn } from '@libs/cn';
import { useThemeStore } from '@store/theme';

type TabMenuProps = {
  text: string;
  isActive: boolean;
  onClick: () => void;
};

const TabMenu = ({ text, isActive, onClick }: TabMenuProps) => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        'relative inline-flex cursor-pointer items-center justify-center rounded-full px-[1.6rem] py-[0.7rem] text-[13px] font-medium transition-all duration-200',
        isActive
          ? 'bg-[#4E49FF] text-white'
          : isLight
            ? 'border border-[var(--ui-300)] bg-[var(--ui-50)] text-[var(--ui-700)] hover:border-[var(--ui-400)] hover:bg-[var(--ui-100)] hover:text-[var(--ui-900)]'
            : 'border border-white/10 bg-white/5 text-[rgba(255,255,255,0.5)] hover:border-white/20 hover:bg-white/10 hover:text-[rgba(255,255,255,0.8)]',
      )}
    >
      {text}
    </button>
  );
};

export default TabMenu;
