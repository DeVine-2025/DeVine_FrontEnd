import { useThemeStore } from '@store/theme';
import {
  BACKEND_DATABASE,
  BACKEND_FRAMEWORK,
  BACKEND_LANGUAGE,
  FRONTEND_LANGUAGE_FRAMEWORK,
  FRONTEND_MOBILE,
  INFRA_CLOUD,
  INFRA_CONTAINER,
  type TechStackChip,
} from '@constants/position-tech-stack';
import CheckFillIcon from "@assets/icons/check-fill.svg?react";

type TechStackChipsProps = {
  techStack?: string[];
};

const TechStackChips = ({ techStack = [] }: TechStackChipsProps) => {
  const { theme } = useThemeStore();

  const normalizeTechKey = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replaceAll(' ', '')
      .replaceAll('.', '')
      .replaceAll('-', '')
      .replaceAll('_', '');

  const ALL_TECH_STACK_BADGES: Array<
    Extract<TechStackChip, { off: string; on: string }>
  > = [
    ...FRONTEND_LANGUAGE_FRAMEWORK,
    ...FRONTEND_MOBILE,
    ...BACKEND_LANGUAGE,
    ...BACKEND_FRAMEWORK,
    ...BACKEND_DATABASE,
    ...INFRA_CLOUD,
    ...INFRA_CONTAINER,
  ].filter(
    (badge): badge is Extract<TechStackChip, { off: string; on: string }> =>
      'off' in badge && 'on' in badge,
  );

  const TECH_BADGE_BY_NAME = new Map<
    string,
    Extract<TechStackChip, { off: string; on: string }>
  >(
    ALL_TECH_STACK_BADGES.flatMap((badge) => [
      [normalizeTechKey(badge.key), badge],
      [normalizeTechKey(badge.label), badge],
    ]),
  );

  const findBadge = (name: string) =>
    TECH_BADGE_BY_NAME.get(normalizeTechKey(name)) ?? null;

  return (
    <div className="flex flex-wrap items-center gap-[4px] relative">
      <CheckFillIcon className="absolute top-[-5px] left-[-6px]"/>
      {techStack.map((name) => {
        const badge = findBadge(name);

        if (badge) {
          const offSrc =
            theme === 'dark' ? badge.offDark ?? badge.off : badge.off;

          return (
            <img
              key={name}
              src={offSrc}
              alt={badge.label}
              className="h-[36px] w-auto select-none"
              draggable={false}
            />
          );
        }

        return (
          <span
            key={name}
            className="flex items-center rounded-[24px] border border-[var(--ui-200)] bg-[var(--ui-100)] px-[12px] py-[8px]"
          >
            <span className="Caption1 font-medium text-[var(--ui-800)]">
              {name}
            </span>
          </span>
        );
      })}
    </div>
  );
};

export default TechStackChips;
