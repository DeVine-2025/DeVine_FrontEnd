import { badgeToneToClass } from 'src/shared/types/badge-tone.types';

type ChipsProps = {
  role: string;
  roleTone: keyof typeof badgeToneToClass;
};

const RoleChips = ({ role, roleTone }: ChipsProps) => {
  return (
    <div className="">
      <span
        className={`rounded-[8px] px-[8px] py-[4px] font-semibold text-xl ${badgeToneToClass[roleTone]}`}
      >
        {role}
      </span>
    </div>
  );
};

export default RoleChips;
