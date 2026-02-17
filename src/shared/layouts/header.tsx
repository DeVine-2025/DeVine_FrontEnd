import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
  subscribeNotificationStream,
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
import { SignedIn, SignedOut, useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import NotificationModal from '@components/common/NotificationModal';
import { useNotificationStore } from '@store/notification';
import { useThemeStore } from '@store/theme';
import { getProfileImageKey, getStoredProfileImageUrl } from '@utils/storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'src/shared/auth/useAuth';

type HeaderProps = {
  navLocked?: boolean;
  onLogoClick?: () => void;
};

const Header = ({ navLocked = false, onLogoClick }: HeaderProps) => {
  const { theme, toggleTheme } = useThemeStore();
  const { isAuthed, user: devUser, setDevAuthed } = useAuth();
  const { getToken, isSignedIn } = useClerkAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationPage, setNotificationPage] = useState(0);
  const [hasNextNotifications, setHasNextNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingMoreNotifications, setLoadingMoreNotifications] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const { user: clerkUser } = useUser();
  const alarmButtonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  const fetchUnreadCount = useCallback(() => {
    getToken().then((token) => {
      if (!token) return;
      getUnreadNotificationCount(token)
        .then((count) => setUnreadCount(count))
        .catch(() => setUnreadCount(0));
    });
  }, [getToken, setUnreadCount]);

  useEffect(() => {
    if (!isSignedIn) return;
    const controller = new AbortController();
    getToken().then((token) => {
      if (!token) return;
      subscribeNotificationStream(
        token,
        {
          onMessage: () => useNotificationStore.getState().incrementUnreadCount(),
        },
        undefined,
        controller.signal,
      );
    });
    return () => controller.abort();
  }, [isSignedIn, getToken]);

  useEffect(() => {
    const syncProfileImage = () => {
      try {
        const stored = getStoredProfileImageUrl(clerkUser?.id ?? null);
        setProfileImageUrl(stored && stored.trim().length > 0 ? stored : null);
      } catch {
        setProfileImageUrl(null);
      }
    };

    syncProfileImage();

    // 서버에서 프로필 이미지를 가져와 localStorage 동기화 (새로고침 시 복원)
    if (clerkUser?.id) {
      getToken().then((token) => {
        if (!token) return;
        const apiBase = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');
        fetch(`${apiBase}/api/v1/members/me`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            const serverImageUrl: string | null =
              data?.result?.member?.imageUrl ?? data?.result?.imageUrl ?? null;
            if (serverImageUrl && serverImageUrl.trim().length > 0) {
              const key = getProfileImageKey(clerkUser.id);
              localStorage.setItem(key, serverImageUrl);
              setProfileImageUrl(serverImageUrl);
            }
          })
          .catch(() => {
            // 서버 조회 실패 시 localStorage 값 유지
          });
      });
    }

    const handleStorage = (event: StorageEvent) => {
      const userKey = getProfileImageKey(clerkUser?.id ?? null);
      const legacyKey = getProfileImageKey();
      if (event.key === userKey || event.key === legacyKey) {
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
  }, [clerkUser?.id, getToken]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!isNotificationOpen) return;
    let cancelled = false;
    setLoadingNotifications(true);
    getToken()
      .then((token) => {
        if (!token || cancelled) return;
        return getNotifications(token, { page: 0, size: 20 });
      })
      .then((result) => {
        if (result && !cancelled) {
          setNotifications(result.notifications);
          setNotificationPage(0);
          setHasNextNotifications(result.hasNext);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotifications([]);
          setHasNextNotifications(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingNotifications(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isNotificationOpen, getToken]);

  const loadMoreNotifications = useCallback(() => {
    if (loadingMoreNotifications || !hasNextNotifications) return;
    setLoadingMoreNotifications(true);
    const pageToLoad = notificationPage + 1;
    getToken()
      .then((token) => {
        if (!token) return;
        return getNotifications(token, { page: pageToLoad, size: 20 });
      })
      .then((result) => {
        if (result) {
          setNotifications((prev) => [...prev, ...result.notifications]);
          setHasNextNotifications(result.hasNext);
          setNotificationPage(pageToLoad);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMoreNotifications(false));
  }, [getToken, notificationPage, hasNextNotifications, loadingMoreNotifications]);

  const handleMarkAsRead = (notificationId: string) => {
    getToken().then((token) => {
      if (!token) return;
      const id = Number(notificationId);
      if (Number.isNaN(id)) return;
      const wasRead = notifications.find((n) => n.id === notificationId)?.isRead ?? false;
      const beforeCount = useNotificationStore.getState().unreadCount;
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      );
      setUnreadCount(Math.max(0, beforeCount - 1));
      markNotificationAsRead(id, token).catch(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: wasRead } : n)),
        );
        setUnreadCount(wasRead ? beforeCount - 1 : beforeCount);
      });
    });
  };

  const handleMarkAllAsRead = () => {
    getToken().then((token) => {
      if (!token) return;
      const prevNotifications = notifications;
      const prevUnreadCount = useNotificationStore.getState().unreadCount;
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      markAllNotificationsAsRead(token).catch(() => {
        setNotifications(prevNotifications);
        setUnreadCount(prevUnreadCount);
      });
    });
  };

  const handleNotificationClick = useCallback(
    (notification: NotificationItem) => {
      // 1) 알림 목록에서 제거 + 배지 숫자 감소 (먼저 반영되어 이동 후에도 없어 보이게)
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      if (!notification.isRead) {
        setUnreadCount(Math.max(0, useNotificationStore.getState().unreadCount - 1));
      }
      getToken().then((token) => {
        if (!token) return;
        const id = Number(notification.id);
        if (!Number.isNaN(id)) markNotificationAsRead(id, token).catch(() => {});
      });
      // 2) 그 다음 개발자 지원현황으로 이동
      navigate('/my-project/dev');
    },
    [navigate, getToken],
  );

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
            <div className="group relative ml-[-14px] flex-items-center gap-[0.4rem]">
              {/* 데스크톱/태블릿 로고 */}
              <button
                type="button"
                onClick={() => {
                  if (navLocked) return;
                  if (onLogoClick) {
                    onLogoClick();
                    return;
                  }
                  navigate('/');
                }}
                disabled={navLocked}
                aria-disabled={navLocked}
                className={`flex-items-center gap-[0.4rem] ${
                  navLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
              >
                <span className="max-[391px]:hidden">
                  {theme === 'dark' ? <LightLogo /> : <DarkLogo />}
                </span>
                <span className="hidden max-[391px]:block">
                  <MobileLogo />
                </span>
              </button>
              {navLocked && (
                <div className="pointer-events-none absolute top-full left-0 mt-2 hidden rounded-md bg-black/80 px-3 py-2 text-[12px] text-white group-hover:block">
                  리포트 생성 중에는 이동할 수 없어요
                </div>
              )}
            </div>

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
                className="Caption1 relative h-[3.2rem] flex-row-center whitespace-nowrap rounded-[8px] bg-[#4E49FF] px-[1.0rem] py-[0.6rem] font-semibold text-white transition-[transform,opacity] duration-150 ease-out hover:opacity-95 active:translate-y-[1px] active:scale-[0.98]"
              >
                프로젝트 등록하기
              </Link>
            </SignedIn>
            {/* 다크모드 토글 */}
            <button
              type="button"
              onClick={toggleTheme}
              className="group max-[391px]:!hidden relative size-[3.6rem] flex-row-center shrink-0 cursor-pointer rounded-[8px] bg-ui-bg"
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
                  className="absolute top-[0.4rem] right-[0.4rem] flex size-5 items-center justify-center rounded-full bg-[#4E49FF] font-semibold text-[0.7rem] text-white leading-none"
                  aria-hidden="true"
                >
                  <span className="absolute inset-0 animate-notification-pulse rounded-full bg-[#4E49FF]" />
                  <span className="relative">{unreadCount > 99 ? '99+' : unreadCount}</span>
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

              <button
                type="button"
                onClick={() => navigate('/my-info')}
                className="-translate-y-[0.15rem] relative h-[2.7rem] w-[2.7rem] shrink-0 cursor-pointer overflow-hidden rounded-full"
                aria-label="내 정보 페이지로 이동"
              >
                <img
                  src={profileImageUrl || clerkUser?.imageUrl}
                  alt="프로필"
                  className="h-full w-full rounded-full object-cover"
                />
              </button>
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
        loading={loadingNotifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onNotificationClick={handleNotificationClick}
        hasMore={hasNextNotifications}
        onLoadMore={loadMoreNotifications}
        loadingMore={loadingMoreNotifications}
      />
    </>
  );
};

export default Header;
