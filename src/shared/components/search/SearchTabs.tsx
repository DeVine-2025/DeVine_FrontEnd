import { NavLink } from 'react-router-dom';

export default function SearchTabs() {
  const baseTabClass = 'Label1 rounded-xl py-3 text-center font-semibold transition-colors';
  const activeClass = 'bg-tab-bg-active text-tab-text-active';
  const inactiveClass = 'text-tab-text-inactive hover:text-tab-text-active';

  return (
    <div className="mb-5 w-[280px] -ml-28 rounded-2xl bg-surface-tab p-2">
      <div className="grid grid-cols-2 gap-2">
        <NavLink
          to="project"
          className={({ isActive }) => `${baseTabClass} ${isActive ? activeClass : inactiveClass}`}
        >
          프로젝트
        </NavLink>

        <NavLink
          to="developer"
          className={({ isActive }) => `${baseTabClass} ${isActive ? activeClass : inactiveClass}`}
        >
          개발자
        </NavLink>
      </div>
    </div>
  );
}
