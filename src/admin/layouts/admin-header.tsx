import DarkLogo from '@assets/icons/logo-dark.svg?react';
import LightLogo from '@assets/icons/logo-light.svg?react';
import ModeDarkHoverIcon from '@assets/icons/mode-dark-hover.svg?react';
import ModeLightIcon from '@assets/icons/mode-light.svg?react';
import ModeLightHoverIcon from '@assets/icons/mode-light-hover.svg?react';
import ModeSettingIcon from '@assets/icons/mode-setting.svg?react';
import { useThemeStore } from '@store/theme';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ADMIN_MENU } from '../constants/admin-menu';

export function AdminHeader() {
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header className="w-full bg-ui-bg">
      <div className="relative mx-auto h-[7rem] w-full max-w-[1180px] flex-row-between pl-6 max-[391px]:px-2 max-[743px]:px-4">
        <div className="flex-items-center gap-[4.8rem] phone:gap-[2rem] tablet:gap-[3rem]">
          <div className="group relative ml-[-14px] flex-items-center gap-[0.4rem]">
            <Link aria-label="DeVine 관리자 홈" to="/admin/dashboard">
              {theme === 'dark' ? <LightLogo /> : <DarkLogo />}
            </Link>
            <span className="Caption1 -top-[4px] absolute left-[calc(100%+4px)] whitespace-nowrap font-semibold text-ui-500">
              관리자
            </span>
          </div>
          <nav className="max-[743px]:!hidden ml-[28px] flex-items-center shrink-0 flex-nowrap gap-[5rem] phone:gap-[2rem] tablet:gap-[3rem]">
            {ADMIN_MENU.map((menu) => (
              <Link
                className={`Label1 group relative shrink-0 whitespace-nowrap px-[0.6rem] py-[0.4rem] transition-all duration-300 ease-out ${
                  isActive(menu.path) ? 'text-ui-800' : 'text-ui-400'
                } hover:text-ui-800`}
                key={menu.path}
                to={menu.path}
              >
                {menu.label}
                <span
                  className={`-translate-x-1/2 absolute bottom-[0.2rem] left-1/2 h-[0.5px] transition-all duration-300 ease-out ${
                    isActive(menu.path)
                      ? 'w-[calc(100%-1.2rem)] opacity-100'
                      : 'w-0 opacity-0 group-hover:w-[calc(100%-1.2rem)] group-hover:opacity-100'
                  } bg-ui-800`}
                />
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex-items-center shrink-0 flex-nowrap gap-[1.2rem] phone:gap-[0.6rem] tablet:gap-[0.8rem]">
          <button
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            className="group relative h-[3.6rem] w-[3.6rem] flex-row-center shrink-0 cursor-pointer rounded-[8px] bg-ui-bg"
            onClick={toggleTheme}
            type="button"
          >
            {theme === 'dark' ? (
              <>
                <ModeSettingIcon className="h-[2.4rem] w-[2.4rem] transition-opacity duration-300 group-hover:opacity-0" />
                <ModeDarkHoverIcon className="absolute h-[2.4rem] w-[2.4rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </>
            ) : (
              <>
                <ModeLightIcon className="h-[2.4rem] w-[2.4rem] transition-opacity duration-300 group-hover:opacity-0" />
                <ModeLightHoverIcon className="absolute h-[2.4rem] w-[2.4rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </>
            )}
          </button>
          <button
            className="group relative h-[3.6rem] flex-row-center shrink-0 cursor-pointer overflow-hidden whitespace-nowrap rounded-[8px] border border-[var(--badge-text-primary)] px-[1.2rem] py-[0.8rem] transition-all duration-300 hover:border-transparent"
            onClick={() => navigate('/admin/login')}
            type="button"
          >
            <span className="absolute inset-0 rounded-[8px] bg-[#4e49ff] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="Caption1 relative z-10 whitespace-nowrap font-semibold text-[#4e49ff] transition-colors duration-300 group-hover:text-white">
              로그아웃
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
