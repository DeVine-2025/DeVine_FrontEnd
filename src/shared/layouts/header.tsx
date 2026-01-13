import { Link, useLocation } from 'react-router-dom';
import { useThemeStore } from '@store/theme';
import DarkLogo from '@assets/icons/logo-dark.svg?react';
import LightLogo from '@assets/icons/logo-light.svg?react';
import AlarmIcon from '@assets/icons/alarm.svg?react';
import ModeSettingIcon from '@assets/icons/mode-setting.svg?react';

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
    <header className="bg-[var(--ui-bg)] w-screen h-[80px] relative left-1/2 -translate-x-1/2">
      <div className="max-w-[1440px] mx-auto px-[80px] h-full flex items-center justify-between">
        {/* 왼쪽: 로고 */}
        <div className="flex items-center gap-[48px]">
        <Link to="/" className="flex items-center gap-[4px]">
          {theme === 'dark' ? <LightLogo /> : <DarkLogo />}
        </Link>

        {/* 중앙: 네비게이션 */}
        <nav className="flex items-center gap-[40px]">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`Headline1 px-[8px] py-[5px] ${
                isActive(item.path)
                  ? 'text-[var(--ui-800)]'
                  : 'text-[var(--ui-400)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* 오른쪽: 액션 버튼들 */}
      <div className="flex items-center gap-[16px]">
        {/* 다크모드 토글 */}
        <button
          type="button"
          onClick={toggleTheme}
          className="bg-[var(--ui-bg)] flex items-center justify-center p-[6px] rounded-[8px] size-[36px]"
        >
          <ModeSettingIcon className="size-[24px]" />
        </button>

        {/* 알림 */}
        <button
          type="button"
          className="bg-[var(--ui-bg)] flex items-center justify-center p-[6px] rounded-[8px] size-[36px]"
        >
          <AlarmIcon className="size-[24px]" />
        </button>

        {/* 회원가입/로그인 버튼 */}
        <Link
          to="/login"
          className="border border-[#3c38bd] flex items-center justify-center h-[36px] px-[12px] py-[8px] rounded-[8px]"
        >
          <span className="Label1 text-[var(--ui-900)]">회원가입/로그인</span>
        </Link>
      </div>
      </div>
    </header>
  );
};

export default Header;
