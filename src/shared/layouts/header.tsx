import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useThemeStore } from '@store/theme';
import DarkLogo from '@assets/icons/logo-dark.svg?react';
import LightLogo from '@assets/icons/logo-light.svg?react';
import MobileLogo from '@assets/icons/logo-mobile.svg?react';
import AlarmIcon from '@assets/icons/alarm.svg?react';
import AlarmLightIcon from '@assets/icons/alarm-light.svg?react';
import AlarmDarkHoverIcon from '@assets/icons/alarm-dark-hover.svg?react';
import AlarmLightHoverIcon from '@assets/icons/alarm-light-hover.svg?react';
import ModeSettingIcon from '@assets/icons/mode-setting.svg?react';
import ModeLightIcon from '@assets/icons/mode-light.svg?react';
import ModeLightHoverIcon from '@assets/icons/mode-light-hover.svg?react';
import ModeDarkHoverIcon from '@assets/icons/mode-dark-hover.svg?react';
import MenuIcon from '@assets/icons/menu.svg?react';
import MenuClosedIcon from '@assets/icons/menu-closed.svg?react';
import NotificationModal from '@components/common/NotificationModal';

const Header = () => {
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const notifications = [
    {
      id: '1',
      title: '프로젝트 제안이 들어왔어요!',
      description: '[닉네임] 님이 제안한 프로젝트를 지금 확인해보세요.',
      timestamp: '4시간 전',
      isRead: false,
    },
    {
      id: '2',
      title: 'Text',
      description: 'Text',
      timestamp: '4시간 전',
      isRead: true,
    },
  ];

  const navItems = [
    { path: '/search', label: '프로젝트/개발자 보기' },
    { path: '/recommend', label: '추천 프로젝트/개발자' },
    { path: '/matching', label: '리포트' },
    { path: '/my-project', label: '내 프로젝트' },
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="bg-[var(--ui-bg)] w-screen relative left-1/2 -translate-x-1/2">
      <div className="w-full px-[12rem] tablet:px-[6rem] max-[743px]:px-[4rem] max-[391px]:px-[2rem] h-[6rem] flex-row-between relative">
        {/* 왼쪽: 로고 + 네비게이션 */}
        <div className="flex-items-center gap-[4.8rem] tablet:gap-[3rem] phone:gap-[2rem]">
          <Link to="/" className="flex-items-center gap-[0.4rem]">
            {/* 데스크톱/태블릿 로고 */}
            <span className="max-[391px]:hidden">
              {theme === 'dark' ? <LightLogo /> : <DarkLogo />}
            </span>
            {/* 모바일 로고 */}
            <span className="hidden max-[391px]:block">
              <MobileLogo />
            </span>
          </Link>

          {/* 네비게이션 - 데스크톱 */}
          <nav className="flex-items-center gap-[5rem] tablet:gap-[3rem] phone:gap-[2rem] flex-nowrap shrink-0 max-[743px]:!hidden">
            {navItems.map((item) => (
              <Link
                key={item.path} 
                to={item.path}
                className={`Label1 px-[0.6rem] py-[0.4rem] relative transition-all duration-300 ease-out group shrink-0 whitespace-nowrap ${
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
        <div className="flex-items-center gap-[1.2rem] tablet:gap-[0.8rem] phone:gap-[0.6rem] flex-nowrap shrink-0">
          {/* 다크모드 토글 */}
          <button
            type="button"
            onClick={toggleTheme}
            className="bg-[var(--ui-bg)] p-[0.4rem] rounded-[8px] size-[3.6rem] group relative shrink-0 flex-row-center max-[391px]:!hidden"
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
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="bg-[var(--ui-bg)] flex-row-center p-[0.4rem] rounded-[8px] size-[3.6rem] group relative shrink-0"
          >
            {theme === 'dark' ? (
              <>
                <AlarmIcon className="size-[2.4rem] transition-opacity duration-300 group-hover:opacity-0" />
                <AlarmDarkHoverIcon className="size-[2.4rem] absolute opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </>
            ) : (
              <>
                <AlarmLightIcon className="size-[2.4rem] transition-opacity duration-300 group-hover:opacity-0" />
                <AlarmLightHoverIcon className="size-[2.4rem] absolute opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </>
            )}
          </button>

          {/* 회원가입/로그인 버튼 */}
          <Link
            to="/login"
            className="border border-[var(--badge-text-primary)] flex-row-center h-[3.6rem] px-[1.2rem] py-[0.8rem] rounded-[8px] transition-all duration-300 hover:border-transparent group relative overflow-hidden shrink-0 whitespace-nowrap"
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
            <span className="Caption1 text-[var(--ui-900)] transition-colors duration-300 group-hover:text-[var(--ui-1000)] relative z-10 whitespace-nowrap">회원가입/로그인</span>
          </Link>

          {/* 햄버거 메뉴 */}
          <button
            type="button"
            onClick={toggleMenu}
            className="!hidden max-[743px]:!flex bg-[var(--ui-bg)] flex-row-center p-[0.4rem] rounded-[8px] size-[3.6rem] shrink-0"
          >
            {isMenuOpen ? (
              <MenuClosedIcon className="size-[2.4rem]" />
            ) : (
              <MenuIcon className="size-[2.4rem]" />
            )}
          </button>
        </div>
      </div>
    </header>
    
    {/* 모바일/태블릿 네비게이션 메뉴 - 전체 페이지 덮기 */}
    <div className={`fixed inset-x-0 top-[6rem] bottom-0 z-40 bg-[var(--ui-bg)] max-[743px]:block hidden transition-opacity duration-300 ${
      isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`}>
        <nav className="flex-col px-[4rem] max-[391px]:px-[2rem] pt-[10rem] gap-[6.4rem]">
          {navItems.map((item, index) => {
            const totalItems = navItems.length;
            const reverseIndex = totalItems - 1 - index;
            return (
            <Link
              key={item.path}
              to={item.path}
              onClick={toggleMenu}
              className={`Title3 font-bold text-[var(--ui-700)] transition-colors duration-300 py-[0.4rem] relative transition-all duration-300 ease-out group inline-block ${
                isMenuOpen ? 'animate-slide-in-right' : 'animate-slide-out-right'
              } ${
                isActive(item.path)
                  ? 'text-[var(--ui-800)]'
                  : ''
              } hover:text-[var(--ui-800)]`}
              style={{
                animationDelay: isMenuOpen ? `${index * 100}ms` : `${reverseIndex * 200}ms`,
                animationFillMode: 'both',
              }}
            >
              <span className="relative inline-block">
                {item.label}
                <span 
                  className="absolute bottom-[0.2rem] left-0 h-[0.5px] w-0 opacity-0 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:w-full bg-[var(--ui-800)]"
                />
              </span>
            </Link>
            );
          })}
        </nav>
      </div>
      
      {/* 알림 모달 */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
      />
    </>
  );
};

export default Header;
