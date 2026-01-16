import AlarmIcon from '@assets/icons/alarm.svg?react';
import DarkLogo from '@assets/icons/logo-dark.svg?react';
import LightLogo from '@assets/icons/logo-light.svg?react';
import ModeSettingIcon from '@assets/icons/mode-setting.svg?react';
import { useThemeStore } from '@store/theme';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();

  const navItems = [
    { path: '/search', label: '프로젝트/개발자 보기' },
    { path: '/recommend', label: '추천 프로젝트/개발자' },
    { path: '/matching', label: '리포트' },
    { path: '/my-project', label: '내 프로젝트' },
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <header className="-translate-x-1/2 relative left-1/2 h-[6rem] w-screen bg-[var(--ui-bg)]">
      <div className="mx-auto h-full max-w-[144rem] flex-row-between px-[12rem]">
        {/* 왼쪽: 로고 + 네비게이션 */}
        <div className="flex-items-center gap-[4.8rem]">
          <Link to="/" className="flex-items-center gap-[0.4rem]">
            {theme === 'dark' ? <LightLogo /> : <DarkLogo />}
          </Link>

          {/* 네비게이션 */}
          <nav className="flex-items-center gap-[5rem]">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`Label1 px-[0.6rem] py-[0.4rem] ${
                  isActive(item.path) ? 'text-[var(--ui-800)]' : 'text-[var(--ui-400)]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* 오른쪽: 액션 버튼들 */}
        <div className="flex-items-center gap-[1.2rem]">
          {/* 다크모드 토글 */}
          <button
            type="button"
            onClick={toggleTheme}
            className="size-[3.6rem] flex-row-center rounded-[8px] bg-[var(--ui-bg)] p-[0.4rem] transition-transform duration-200 hover:scale-110 hover:bg-[var(--ui-100)]"
          >
            <ModeSettingIcon className="size-[2.4rem] transition-colors duration-200" />
          </button>

          {/* 알림 */}
          <button
            type="button"
            className="size-[3.6rem] flex-row-center rounded-[8px] bg-[var(--ui-bg)] p-[0.4rem]"
          >
            <AlarmIcon className="size-[2.4rem]" />
          </button>

          {/* 회원가입/로그인 버튼 */}
          <Link
            to="/login"
            className="h-[2.8rem] flex-row-center rounded-[8px] border border-[var(--badge-text-primary)] px-[1rem] py-[0.6rem]"
          >
            <span className="Caption1 text-[var(--ui-900)]">회원가입/로그인</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
