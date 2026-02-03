import { badgeToneToClass } from 'src/shared/types/badgeTone';


type ChipsProps = {
  role: string;
  roleTone: keyof typeof badgeToneToClass;
}

const RoleChips = ({role, roleTone}: ChipsProps) => {
  return (
    <div className="">
          <span
            className={`Label1 rounded-[8px] px-[8px] py-[4px] font-semibold ${badgeToneToClass[roleTone]}`}
          >
            {role}
          </span>
    </div>
  );
};

export default RoleChips;