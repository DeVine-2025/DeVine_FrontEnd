import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from '@apis/notifications';
import AlarmIcon from '@assets/icons/alarm.svg?react';
import AlarmDarkHoverIcon from '@assets/icons/alarm-dark-hover.svg?react';
import AlarmLightIcon from '@assets/icons/alarm-light.svg?react';
import AlarmLightHoverIcon from '@assets/icons/alarm-light-hover.svg?react';
import DarkLogo from '@assets/icons/logo-dark.svg?react';
import LightLogo from '@assets/icons/logo-light.svg?react';
import MobileLogo from '@assets/icons/logo-mobile.svg?react';
import MenuIcon from '@assets/icons/menu.svg?react';
import MenuClosedIcon from '@assets/icons/menu-closed.svg?react';
import ModeDarkHoverIcon from '@assets/icons/mode-dark-hover.svg?react';
import ModeLightIcon from '@assets/icons/mode-light.svg?react';
import ModeLightHoverIcon from '@assets/icons/mode-light-hover.svg?react';
import ModeSettingIcon from '@assets/icons/mode-setting.svg?react';
import { SignedIn, SignedOut, UserButton, useAuth as useClerkAuth } from '@clerk/clerk-react';
import NotificationModal from '@components/common/NotificationModal';
import { useThemeStore } from '@store/theme';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from 'src/shared/auth/useAuth';

const Header = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { isAuthed, user, setDevAuthed } = useAuth();
  const { getToken } = useClerkAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const alarmButtonRef = useRef<HTMLButtonElement>(null);

  const fetchUnreadCount = useCallback(() => {
    getToken().then((token) => {
      if (!token) return;
      getUnreadNotificationCount(token)
<<<<<<< HEAD
        .then((count) => {
          setUnreadCount(count);
          console.log('[알림] 읽지 않은 개수:', count);
        })
        .catch((e) => {
          setUnreadCount(0);
          console.warn('[알림] unread-count 실패', e);
        });
=======
        .then(setUnreadCount)
        .catch(() => setUnreadCount(0));
>>>>>>> origin/develope
    });
  }, [getToken]);

  useEffect(() => {
    const syncProfileImage = () => {
      try {
        const stored = localStorage.getItem('profile_image_url');
        setProfileImageUrl(stored && stored.trim().length > 0 ? stored : null);
      } catch {
        setProfileImageUrl(null);
      }
    };

    syncProfileImage();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'profile_image_url') {
        syncProfileImage();
      }
    };
    const handleProfileUpdate = () => syncProfileImage();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('profile-image-updated', handleProfileUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('profile-image-updated', handleProfileUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!isNotificationOpen) return;
    let cancelled = false;
    console.log('[알림] 목록 조회 요청');
    getToken()
      .then((token) => {
        if (!token || cancelled) return;
        return getNotifications(token, { page: 0, size: 20 });
      })
      .then((result) => {
        if (result && !cancelled) {
          setNotifications(result.notifications);
          console.log('[알림] 목록 조회 성공', result.notifications.length, '건', result.notifications);
        }
      })
      .catch((e) => {
        if (!cancelled) setNotifications([]);
        console.warn('[알림] 목록 조회 실패', e);
      });
    return () => {
      cancelled = true;
    };
  }, [isNotificationOpen, getToken]);

  const handleMarkAsRead = (notificationId: string) => {
    getToken().then((token) => {
      if (!token) return;
      const id = Number(notificationId);
      if (Number.isNaN(id)) return;
      console.log('[알림] 읽음 처리 요청', notificationId);
      markNotificationAsRead(id, token)
        .then(() => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
          );
          setUnreadCount((c) => Math.max(0, c - 1));
          console.log('[알림] 읽음 처리 성공', notificationId);
        })
        .catch((e) => console.warn('[알림] 읽음 처리 실패', notificationId, e));
    });
  };

  const handleMarkAllAsRead = () => {
    getToken().then((token) => {
      if (!token) return;
      console.log('[알림] 전체 읽음 처리 요청');
      markAllNotificationsAsRead(token)
        .then((result) => {
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
          setUnreadCount(0);
          console.log('[알림] 전체 읽음 처리 성공', result?.markedCount ?? '');
        })
        .catch((e) => console.warn('[알림] 전체 읽음 처리 실패', e));
    });
  };

  const navItems = [
    { path: '/search', label: '프로젝트/개발자 보기' },
    { path: '/recommend', label: '추천 프로젝트/개발자' },
    { path: '/report', label: '리포트' },
    { path: '/my-project', label: '지원 현황' },
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="w-full bg-ui-bg">
        <div className="relative mx-auto h-[7rem] w-full max-w-[1180px] flex-row-between pl-6 max-[391px]:px-2 max-[743px]:px-4">
          {/* 왼쪽: 로고 + 네비게이션 */}
          <div className="flex-items-center gap-[4.8rem] phone:gap-[2rem] tablet:gap-[3rem]">
            <Link to="/" className="ml-[-14px] flex-items-center gap-[0.4rem]">
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
            <nav className="max-[743px]:!hidden ml-[28px] flex-items-center shrink-0 flex-nowrap gap-[5rem] phone:gap-[2rem] tablet:gap-[3rem]">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`Label1 group relative shrink-0 whitespace-nowrap px-[0.6rem] py-[0.4rem] transition-all duration-300 ease-out ${
                    isActive(item.path) ? 'text-ui-800' : 'text-ui-400'
                  } hover:text-ui-800`}
                >
                  {item.label}
                  <span
                    className={`-translate-x-1/2 absolute bottom-[0.2rem] left-1/2 h-[0.5px] transition-all duration-300 ease-out ${
                      isActive(item.path)
                        ? 'w-[calc(100%-1.2rem)] opacity-100'
                        : 'w-0 opacity-0 group-hover:w-[calc(100%-1.2rem)] group-hover:opacity-100'
                    } bg-ui-800`}
                  />
                </Link>
              ))}
            </nav>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex-items-center shrink-0 flex-nowrap gap-[1.2rem] phone:gap-[0.6rem] tablet:gap-[0.8rem]">
            <SignedIn>
              <Link
                to="/project/create"
                className="Caption1 group hover:-translate-y-[1px] relative h-[3.2rem] flex-row-center overflow-hidden whitespace-nowrap rounded-[8px] bg-[#4E49FF] px-[1.0rem] py-[0.6rem] font-semibold text-white transition-transform duration-200 ease-out hover:shadow-[0px_10px_24px_rgba(78,73,255,0.25)] active:translate-y-0 active:shadow-none"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 45%, rgba(255,255,255,0) 90%)',
                  }}
                />
                <span
                  aria-hidden
                  className="-left-[40%] -skew-x-12 pointer-events-none absolute top-0 h-full w-[40%] bg-white/20 opacity-0 transition-[transform,opacity] duration-300 ease-out group-hover:translate-x-[380%] group-hover:opacity-100"
                />
                <span className="relative z-10">프로젝트 등록하기</span>
              </Link>
            </SignedIn>
            {/* 다크모드 토글 */}
            <button
              type="button"
              onClick={toggleTheme}
              className="group max-[391px]:!hidden relative size-[3.6rem] flex-row-center shrink-0 cursor-pointer rounded-[8px] bg-ui-bg p-[0.4rem]"
            >
              {theme === 'dark' ? (
                <>
                  <ModeSettingIcon className="size-[2.4rem] transition-opacity duration-300 group-hover:opacity-0" />
                  <ModeDarkHoverIcon className="absolute size-[2.4rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </>
              ) : (
                <>
                  <ModeLightIcon className="size-[2.4rem] transition-opacity duration-300 group-hover:opacity-0" />
                  <ModeLightHoverIcon className="absolute size-[2.4rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </>
              )}
            </button>

            {/* 알림 */}
            <button
              ref={alarmButtonRef}
              type="button"
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                if (isNotificationOpen) fetchUnreadCount();
              }}
              className="group relative size-[3.6rem] flex-row-center shrink-0 cursor-pointer rounded-[8px] bg-ui-bg p-[0.4rem]"
              aria-label={
                unreadCount > 0
                  ? `알림 열기. 읽지 않은 알림 ${unreadCount > 99 ? '99+' : unreadCount}건`
                  : '알림 열기'
              }
            >
              {theme === 'dark' ? (
                <>
                  <AlarmIcon className="size-[2.4rem] transition-opacity duration-300 group-hover:opacity-0" />
                  <AlarmDarkHoverIcon className="absolute size-[2.4rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </>
              ) : (
                <>
                  <AlarmLightIcon className="size-[2.4rem] transition-opacity duration-300 group-hover:opacity-0" />
                  <AlarmLightHoverIcon className="absolute size-[2.4rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </>
              )}

              {unreadCount > 0 && (
                <span
                  className="absolute top-[0.4rem] right-[0.4rem] flex min-w-[1.6rem] items-center justify-center rounded-full bg-[#FF4D4F] px-[0.5rem] py-0 font-semibold text-[1rem] text-white leading-none"
                  aria-hidden="true"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <SignedIn>
              <Link
                to="/my-info"
                className="Caption1 whitespace-nowrap text-[var(--ui-700)] transition-colors duration-300 hover:text-[var(--ui-900)]"
              >
                내 정보
              </Link>

              <div className="relative">
                {profileImageUrl && (
                  <img
                    src={profileImageUrl}
                    alt="프로필"
                    className="pointer-events-none absolute inset-0 h-[2.7rem] w-[2.7rem] rounded-full object-cover"
                  />
                )}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: '!w-[2.7rem] !h-[2.7rem] !rounded-full',
                      avatarImage: profileImageUrl ? '!opacity-0' : '',
                    },
                  }}
                />
              </div>
            </SignedIn>

            <SignedOut>
              {/* 회원가입/로그인 버튼 */}
              <Link
                to="/login"
                className="group relative h-[3.6rem] flex-row-center shrink-0 overflow-hidden whitespace-nowrap rounded-[8px] border border-[var(--badge-text-primary)] px-[1.2rem] py-[0.8rem] transition-all duration-300 hover:border-transparent"
              >
                <span
                  className="absolute inset-0 rounded-[8px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: '#4E49FF',
                  }}
                />
                <span
                  className="-inset-[2px] -z-10 absolute rounded-[10px] opacity-0 blur-[8px] transition-opacity duration-300 group-hover:opacity-20"
                  style={{
                    background: '#7E7AFF',
                  }}
                />
                <span className="Caption1 relative z-10 whitespace-nowrap text-[var(--ui-900)] transition-colors duration-300 group-hover:text-[var(--ui-1000)]">
                  회원가입/로그인
                </span>
              </Link>
            </SignedOut>

            {/* 햄버거 메뉴 */}
            <button
              type="button"
              onClick={toggleMenu}
              className="!hidden max-[743px]:!flex size-[3.6rem] flex-row-center shrink-0 cursor-pointer rounded-[8px] bg-ui-bg p-[0.4rem]"
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
      <div
        className={`fixed inset-x-0 top-[6rem] bottom-0 z-40 hidden bg-ui-bg transition-opacity duration-300 max-[743px]:block ${
          isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <nav className="flex-col gap-[6rem] px-[4rem] pt-[10rem] max-[391px]:px-[2rem]">
          {navItems.map((item, index) => {
            const totalItems = navItems.length;
            const reverseIndex = totalItems - 1 - index;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={toggleMenu}
                className={`Title3 group relative inline-block py-[0.4rem] font-bold text-ui-700 transition-all duration-300 ease-out ${
                  isMenuOpen ? 'animate-slide-in-right' : 'animate-slide-out-right'
                } ${isActive(item.path) ? 'text-ui-800' : ''} hover:text-ui-800`}
                style={{
                  animationDelay: isMenuOpen ? `${index * 100}ms` : `${reverseIndex * 200}ms`,
                  animationFillMode: 'both',
                }}
              >
                <span className="relative inline-block">
                  {item.label}
                  <span className="absolute bottom-[0.2rem] left-0 h-[0.5px] w-0 bg-ui-800 opacity-0 transition-all duration-300 ease-out group-hover:w-full group-hover:opacity-100" />
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 알림 모달 */}
      <NotificationModal
        anchorRef={alarmButtonRef}
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </>
  );
};

export default Header;
