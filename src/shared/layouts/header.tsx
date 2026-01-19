import { Link, useLocation } from 'react-router-dom';
import { useThemeStore } from '@store/theme';
import DarkLogo from '@assets/icons/logo-dark.svg?react';
import LightLogo from '@assets/icons/logo-light.svg?react';
import AlarmIcon from '@assets/icons/alarm.svg?react';
import AlarmLightIcon from '@assets/icons/alarm-light.svg?react';
import ModeSettingIcon from '@assets/icons/mode-setting.svg?react';
import ModeLightIcon from '@assets/icons/mode-light.svg?react';
import ModeLightHoverIcon from '@assets/icons/mode-light-hover.svg?react';
import ModeDarkHoverIcon from '@assets/icons/mode-dark-hover.svg?react';

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
    <header className="bg-[var(--ui-bg)] w-screen h-[6rem] relative left-1/2 -translate-x-1/2">
      <div className="max-w-[144rem] mx-auto px-[12rem] h-full flex-row-between relative">
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
                className={`Label1 px-[0.6rem] py-[0.4rem] relative transition-all duration-300 ease-out group ${
                  isActive(item.path)
                    ? 'text-[var(--ui-800)]'
                    : 'text-[var(--ui-400)]'
                } hover:text-[var(--ui-800)]`}
              >
                {item.label}
                <span 
                  className={`absolute bottom-[0.2rem] left-1/2 -translate-x-1/2 h-[0.5px] transition-all duration-300 ease-out ${
                    isActive(item.path) 
                      ? 'w-[calc(100%-1.2rem)] opacity-100' 
                      : 'w-0 opacity-0 group-hover:opacity-100 group-hover:w-[calc(100%-1.2rem)]'
                  } bg-[var(--ui-800)]`}
                />
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
          className="bg-[var(--ui-bg)] flex-row-center p-[0.4rem] rounded-[8px] size-[3.6rem] group relative"
        >
          {theme === 'dark' ? (
            <>
              <ModeSettingIcon className="size-[2.4rem] transition-opacity duration-300 group-hover:opacity-0" />
              <ModeDarkHoverIcon className="size-[2.4rem] absolute opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </>
          ) : (
            <>
              <ModeLightIcon className="size-[2.4rem] transition-opacity duration-300 group-hover:opacity-0" />
              <ModeLightHoverIcon className="size-[2.4rem] absolute opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </>
          )}
        </button>

        {/* 알림 */}
        <button
          type="button"
          className="bg-[var(--ui-bg)] flex-row-center p-[0.4rem] rounded-[8px] size-[3.6rem]"
        >
          {theme === 'dark' ? (
            <AlarmIcon className="size-[2.4rem]" />
          ) : (
            <AlarmLightIcon className="size-[2.4rem]" />
          )}
        </button>

        {/* 회원가입/로그인 버튼 */}
        <Link
          to="/login"
          className="border border-[var(--badge-text-primary)] flex-row-center h-[3.6rem] max-md:h-[3.6rem] px-[1.2rem] py-[0.8rem] rounded-[8px] transition-all duration-300 hover:border-transparent group relative overflow-hidden"
        >
          <span 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[8px]"
            style={{
              background: 'linear-gradient(135deg, #7E7AFF 0%, #9D8FFF 50%, #7E7AFF 100%)',
            }}
          />
          <span 
            className="absolute -inset-[2px] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-[10px] blur-[8px] -z-10"
            style={{
              background: '#7E7AFF',
            }}
          />
          <span className="Caption1 text-[var(--ui-900)] transition-colors duration-300 group-hover:text-[var(--ui-1000)] relative z-10">회원가입/로그인</span>
        </Link>
      </div>
      </div>
    </header>
  );
};

export default Header;
