import { NavLink } from 'react-router-dom';

const MyProjectTabs = () => {
  const baseTabClass = 'rounded-xl py-3 text-xl text-center font-semibold transition-colors';
  const activeClass = 'bg-tab-bg-active text-tab-text-active';
  const inactiveClass = 'text-tab-text-inactive hover:text-tab-text-active';
  return (
    <div className="mb-5 w-[280px] rounded-2xl bg-surface-tab p-2">
      <div className="grid grid-cols-2 gap-2">
        <NavLink
          to="my-pm-project"
          className={({ isActive }) => `${baseTabClass} ${isActive ? activeClass : inactiveClass}`}
        >
          PM
        </NavLink>

        <NavLink
          to="my-developer-project"
          className={({ isActive }) => `${baseTabClass} ${isActive ? activeClass : inactiveClass}`}
        >
          개발자
        </NavLink>
      </div>
    </div>
  );
};

export default MyProjectTabs;
