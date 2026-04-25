import { cn } from '@libs/cn';

type DomainBadgesProps = {
  label: string;
  className?: string;
}

const DomainBadges = ({label, className}: DomainBadgesProps) => {
  return (
    <span
      className={cn('Caption1 inline-flex w-fit h-[24px] items-center justify-center rounded-[8px] bg-ui-100 px-[6px] font-semibold text-ui-600', className)}>
      {label}
    </span>
  );
};

export default DomainBadges;