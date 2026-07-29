import { getTechBadgeByName, TECH_STACK_LABEL_BY_KEY } from '@constants/position-tech-stack';
import { useThemeStore } from '@store/theme';

type StackItem = {
  key: string;
  source: 'AUTO' | 'MANUAL';
};

type StackChipsProps = {
  stacks: StackItem[];
  onRemove?: (stack: string) => void;
};

const StackChips = ({ stacks, onRemove }: StackChipsProps) => {
  const { theme } = useThemeStore();

  const removeStack = (key: string) => {
    onRemove?.(key);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {stacks.map((item) => {
        const key = item.key;
        const label = TECH_STACK_LABEL_BY_KEY[key] ?? key;
        const badge = getTechBadgeByName(label);
        const iconSrc =
          badge && 'off' in badge && 'on' in badge
            ? theme === 'dark'
              ? (badge.offDark ?? badge.off)
              : badge.off
            : undefined;

        return (
          <button
            key={key}
            type="button"
            className="relative inline-flex items-center"
          >
            {iconSrc ? (
              <img src={iconSrc} alt={`${label} 배지`} className="h-[32px] w-auto" loading="lazy" />
            ) : (
              <div className="inline-flex h-[32px] items-center gap-[8px] rounded-[24px] bg-[var(--ui-100)] px-[12px] py-[6px] ring-[1.5px] ring-[var(--ui-200)]">
                <span className="Caption1 font-medium text-[var(--ui-800)]">{label}</span>
              </div>
            )}
            {item.source === "MANUAL" && <span
              onClick={() => removeStack(key)}
              aria-hidden
              className="-right-[4px] -top-[4px] absolute flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-full bg-[var(--ui-50)] text-[11px] text-[var(--ui-400)]"
            >
              ×
            </span>}
          </button>
        );
      })}
    </div>
  );
};

export default StackChips;
