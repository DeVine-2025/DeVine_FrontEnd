import { NavLink } from 'react-router-dom';

export default function SearchTabs() {
  const baseTabClass = 'rounded-xl py-3 text-xl text-center font-semibold transition-colors';
  const activeClass = 'bg-[#111318] text-white';
  const inactiveClass = 'text-gray-400 hover:text-gray-200';

  return (
    <div className="w-[280px] rounded-2xl bg-[#2F323A] p-2">
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
