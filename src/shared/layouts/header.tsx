import BrandLogo from '@assets/images/devine-wordmark.png';
import { useMockData } from '../config/data-mode';
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
  subscribeNotificationStream,
} from '@apis/notifications';
import MenuIcon from '@assets/icons/menu.svg?react';
import MenuClosedIcon from '@assets/icons/menu-closed.svg?react';
import TicketNeon from '@assets/icons/ticket-neon.svg?react';
import { SignedIn, SignedOut, useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import NotificationModal from '@components/common/NotificationModal';
import { myCreditsQuery } from '@apis/payment/payment-queries';
import { useAuthMe } from '@hooks/useAuthMe';
import { useElasticUnderline } from '@hooks/useElasticUnderline';
import { useNotificationStore } from '@store/notification';
import { getProfileImageKey, getStoredProfileImageUrl } from '@utils/storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

type HeaderProps = {
  navLocked?: boolean;
  onLogoClick?: () => void;
};

const Header = ({ navLocked = false, onLogoClick }: HeaderProps) => {
  const { getToken, isSignedIn } = useClerkAuth();
  const location = useLocation();
  const { navRef, indicatorRef } = useElasticUnderline(location.pathname);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [sampleNotifications, setSampleNotifications] = useState<NotificationItem[]>(() => useMockData ? [
    { id: 'sample-application', title: '[샘플] 새로운 프로젝트 지원', description: '플로우업 프로젝트에 새로운 지원자가 도착했어요.', timestamp: '5분 전', isRead: false },
    { id: 'sample-invitation', title: '[샘플] 협업 제안이 도착했어요', description: '커넥트업 팀에서 함께 프로젝트를 진행하고 싶어 해요.', timestamp: '2시간 전', isRead: false },
    { id: 'sample-report', title: '[샘플] 프로젝트 리포트 생성 완료', description: 'GitHub 프로젝트 분석이 완료됐어요. 리포트를 확인해 보세요.', timestamp: '어제', isRead: true },
  ] : []);
  const [notificationPage, setNotificationPage] = useState(0);
  const [hasNextNotifications, setHasNextNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingMoreNotifications, setLoadingMoreNotifications] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const { user: clerkUser } = useUser();
  const profileImageSrc = profileImageUrl || (clerkUser?.hasImage ? clerkUser.imageUrl : null);
  const profileInitial =
    clerkUser?.firstName?.trim().charAt(0) ||
    clerkUser?.username?.trim().charAt(0) ||
    clerkUser?.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase() ||
    'D';
  const alarmButtonRef = useRef<HTMLButtonElement>(null);
  const isSignupFlow = location.pathname.startsWith('/signup');
  const isTermsPage = location.pathname.startsWith('/terms/');
  const { data: memberStatus } = useAuthMe();
  const isOnboardingComplete = memberStatus?.isRegistered === true;
  const canUseMemberProtectedApis = isSignedIn === true && isOnboardingComplete && !isSignupFlow;
  const { data: myCredits } = useQuery(myCreditsQuery(canUseMemberProtectedApis));

  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  const fetchUnreadCount = useCallback(() => {
    if (!canUseMemberProtectedApis) return;
    getToken().then((token) => {
      if (!token) return;
      getUnreadNotificationCount(token)
        .then((count) => setUnreadCount(count))
        .catch(() => setUnreadCount(0));
    });
  }, [canUseMemberProtectedApis, getToken, setUnreadCount]);

  // 로그아웃 시 알림 개수 초기화
  useEffect(() => {
    if (isSignedIn !== true) setUnreadCount(0);
  }, [isSignedIn, setUnreadCount]);

  // 로그인한 경우에만 알림 SSE 구독 (비로그인 시 호출/연결하지 않음)
  useEffect(() => {
    if (!canUseMemberProtectedApis) return;
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
  }, [canUseMemberProtectedApis, getToken]);

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
    if (clerkUser?.id && canUseMemberProtectedApis) {
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
  }, [canUseMemberProtectedApis, clerkUser?.id, getToken]);

  useEffect(() => {
    if (!canUseMemberProtectedApis) return;
    fetchUnreadCount();
  }, [canUseMemberProtectedApis, fetchUnreadCount]);

  useEffect(() => {
    if (!canUseMemberProtectedApis || !isNotificationOpen) return;
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
    { path: '/search/projects', label: '탐색' },
    { path: '/recommend', label: '추천' },
    { path: '/report', label: '리포트' },
    { path: '/my-project', label: '지원 현황' },
    { path: '/project/create', label: '프로젝트 등록' },
  ];

  const isActive = (path: string) => {
    return path === '/search/projects' ? location.pathname.startsWith('/search') : location.pathname.startsWith(path);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="w-full border-b border-white/[0.04] bg-ui-bg">
        <div className="desktop-content relative mx-auto h-[7rem] w-[var(--desktop-content-width,100%)] max-w-none flex-row-between px-8 max-[391px]:px-2 max-[743px]:px-4 lg:max-2xl:px-0">
          {/* 왼쪽: 로고 + 네비게이션 */}
          <div className="flex-items-center gap-[4.8rem] phone:gap-[2rem] tablet:gap-[3rem]">
            <div className="group relative ml-[-14px] flex-items-center gap-[0.4rem] lg:max-2xl:ml-0">
              {/* 데스크톱/태블릿 로고 */}
              <button
                type="button"
                onClick={() => {
                  if (navLocked) return;
                  if (onLogoClick) {
                    onLogoClick();
                    return;
                  }
                  navigate('/home');
                }}
                disabled={navLocked}
                aria-disabled={navLocked}
                className={`flex-items-center gap-[0.4rem] ${
                  navLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
              >
                <span className="max-[391px]:hidden">
                  <img src={BrandLogo} alt="Devine" className="h-auto w-[136px] max-w-full object-contain" />
                </span>
                <span className="hidden max-[391px]:block">
                  <img src={BrandLogo} alt="Devine" className="h-auto w-[136px] max-w-full object-contain" />
                </span>
              </button>
              {navLocked && (
                <div className="pointer-events-none absolute top-full left-0 mt-2 hidden rounded-md bg-black/80 px-3 py-2 text-[12px] text-white group-hover:block">
                  리포트 생성 중에는 이동할 수 없어요
                </div>
              )}
            </div>

            {/* 네비게이션 - 데스크톱 */}
            <nav ref={navRef} className="relative max-[743px]:!hidden ml-[28px] flex-items-center shrink-0 flex-nowrap gap-[2.6rem] phone:gap-[2rem] tablet:gap-[2.6rem]">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative shrink-0 whitespace-nowrap py-[0.4rem] text-[1.4rem] font-medium transition-colors duration-200 ${
                    isActive(item.path) ? 'text-ui-1000' : 'text-[#A1A1AA]'
                  } hover:text-ui-800`}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  {item.label}
                  <span
                    className={`-translate-x-1/2 absolute bottom-0 left-1/2 h-[2px] rounded-full transition-all duration-300 ease-out ${
                      isActive(item.path)
                        ? 'w-0 opacity-0'
                        : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
                    } bg-primary`}
                  />
                </Link>
              ))}
              <span ref={indicatorRef} aria-hidden="true" className="pointer-events-none invisible absolute bottom-0 left-0 h-[2px] rounded-full bg-primary" />
            </nav>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex-items-center shrink-0 flex-nowrap gap-[1.6rem] phone:gap-[0.8rem] tablet:gap-[1.2rem]">
            <SignedIn>
              {!isTermsPage && !isSignupFlow && (
                  <Link
                    to="/pay"
                    aria-label={
                      typeof myCredits?.remainingCount === 'number'
                        ? `이용권 ${myCredits.remainingCount}장, 구매 페이지로 이동`
                        : '이용권 구매 페이지로 이동'
                    }
                    className="group flex h-[4rem] shrink-0 items-center gap-[0.7rem] whitespace-nowrap text-[var(--ui-500)] transition-colors hover:text-[var(--ui-800)]"
                  >
                    <TicketNeon aria-hidden="true" className="h-[1.6rem] w-[2.2rem] shrink-0" />
                    <span className="text-[1.4rem] font-medium">이용권 구매</span>
                  </Link>
              )}
            </SignedIn>
            {/* 알림 */}
            <button
              ref={alarmButtonRef}
              type="button"
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                if (isNotificationOpen) fetchUnreadCount();
              }}
              className="group relative size-[4rem] flex-row-center shrink-0 cursor-pointer text-[var(--ui-500)] transition-colors duration-200 hover:text-[var(--ui-800)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label={
                unreadCount > 0
                  ? `알림 열기. 읽지 않은 알림 ${unreadCount > 99 ? '99+' : unreadCount}건`
                  : '알림 열기'
              }
            >
              <svg aria-hidden="true" className="size-[2rem]" viewBox="0 0 24 24" fill="none">
                <path d="M18 9.8a6 6 0 0 0-12 0c0 7-3 7.2-3 8.7h18c0-1.5-3-1.7-3-8.7ZM10 21h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              {unreadCount > 0 && (
                <span
                  className="absolute top-[0.4rem] right-[0.4rem] flex size-5 items-center justify-center rounded-full bg-[#6654F5] font-semibold text-[0.7rem] text-white leading-none"
                  aria-hidden="true"
                >
                  <span className="absolute inset-0 animate-notification-pulse rounded-full bg-[#6654F5]" />
                  <span className="relative">{unreadCount > 99 ? '99+' : unreadCount}</span>
                </span>
              )}
            </button>

            <SignedIn>
              <button
                type="button"
                onClick={() => navigate('/my-info')}
                className="relative flex h-[3.2rem] w-[3.2rem] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#665C7A] text-[1.4rem] font-medium text-white transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label="내 정보 페이지로 이동"
              >
                {profileImageSrc ? (
                  <img src={profileImageSrc} alt="프로필" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span aria-hidden="true">{profileInitial}</span>
                )}
              </button>
            </SignedIn>

            <SignedOut>
              {/* 회원가입/로그인 버튼 */}
              {!isTermsPage && (
                <Link
                  to="/login"
                  className="group relative h-[3.6rem] flex-row-center shrink-0 overflow-hidden whitespace-nowrap rounded-[8px] border border-ui-200 px-[1.2rem] py-[0.8rem] transition-all duration-300 hover:border-transparent"
                >
                  <span
                    className="absolute inset-0 rounded-[8px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: '#6654F5',
                    }}
                  />
                  <span
                    className="-inset-[2px] -z-10 absolute rounded-[10px] opacity-0 blur-[8px] transition-opacity duration-300 group-hover:opacity-20"
                    style={{
                      background: '#7B6BFF',
                    }}
                  />
                  <span className="Caption1 relative z-10 whitespace-nowrap text-[var(--ui-900)] transition-colors duration-300 group-hover:text-[var(--ui-1000)]">
                    회원가입/로그인
                  </span>
                </Link>
              )}
            </SignedOut>

            {/* 햄버거 메뉴 */}
            <button
              type="button"
              onClick={toggleMenu}
              className="!hidden max-[743px]:!flex size-[3.6rem] flex-row-center shrink-0 cursor-pointer rounded-[10px] bg-ui-50 p-[0.4rem] transition-colors hover:bg-ui-100"
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
        notifications={[...sampleNotifications, ...notifications]}
        loading={loadingNotifications}
        onMarkAsRead={(id) => id.startsWith('sample-') ? setSampleNotifications((items) => items.map((item) => item.id === id ? { ...item, isRead: true } : item)) : handleMarkAsRead(id)}
        onMarkAllAsRead={() => {
          setSampleNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
          if (notifications.some((item) => !item.isRead)) handleMarkAllAsRead();
        }}
        onNotificationClick={(notification) => {
          if (notification.id.startsWith('sample-')) {
            setSampleNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, isRead: true } : item));
          } else {
            handleNotificationClick(notification);
          }
        }}
        hasMore={hasNextNotifications}
        onLoadMore={loadMoreNotifications}
        loadingMore={loadingMoreNotifications}
      />
    </>
  );
};

export default Header;
