import CheckFillIcon from '@assets/icons/check-fill.svg?react';
import { cn } from '@libs/cn';
import { findTechBadge } from '@libs/tech-stack-utils';
import { useThemeStore } from '@store/theme.store';
import type { TechStackSource } from '@t/profile-card.types';

export type TechStackChipInput =
  | string
  | { name: string; genre?: string | null; source?: TechStackSource };

/** `genre` 필터 후 칩에 쓰는 항목 (`source`는 API에서 오면 그대로 전달) */
export type TechStackDisplayItem = {
  name: string;
  source?: TechStackSource;
};

type TechStackChipsProps = {
  techStack?: TechStackChipInput[];
};

function chipInputsToDisplayItems(items: TechStackChipInput[]): TechStackDisplayItem[] {
  return items
    .filter((item) => typeof item === 'string' || item.genre !== null)
    .map((item) =>
      typeof item === 'string' ? { name: item } : { name: item.name, source: item.source },
    );
}

const TechStackChips = ({ techStack = [] }: TechStackChipsProps) => {
  const { theme } = useThemeStore();
  const displayItems = chipInputsToDisplayItems(techStack);

  return (
    <div className="flex flex-wrap items-center gap-[4px]">
      {displayItems.map(({ name, source }) => {
        const badge = findTechBadge(name);

        if (badge) {
          const offSrc = theme === 'dark' ? badge.offDark ?? badge.off : badge.off;

          return (
            <div key={`${name}`} className="relative">
              {source === 'AUTO' && (
                <CheckFillIcon className="absolute top-[-5px] left-[-6px] text-ui-50" />
              )}
              <img
                src={offSrc}
                alt={badge.label}
                className={cn(
                  'h-[36px] w-auto select-none rounded-full border',
                  source === 'AUTO' ? 'border-primary' : 'border-ui-200',
                )}
                draggable={false}
              />
            </div>
          );
        }

        return (
          <span
            key={`${name}`}
            className={cn(
              'flex items-center rounded-[24px] border bg-ui-100 px-[12px] py-[8px]',
              source === 'AUTO' ? 'border-primary' : 'border-ui-200',
            )}
          >
            <span className="Caption1 font-medium text-ui-800">{name}</span>
          </span>
        );
      })}
    </div>
  );
};

export default TechStackChips;
