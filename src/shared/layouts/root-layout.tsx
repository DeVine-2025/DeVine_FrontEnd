import { useUser } from '@clerk/clerk-react';
import { useAuthMe } from '@hooks/useAuthMe';
import FloatingChatWidget from '@components/chat/FloatingChatWidget';
import FloatingProjectCreateCta from '@components/common/FloatingProjectCreateCta';
import Footer from '@layouts/footer';
import Header from '@layouts/header';
import { trackPageView } from '@libs/analytics';
import { type UserRole, useAuthStore } from '@store/auth';
import { getStoredUserRole, setCurrentUserId } from '@utils/storage';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

export type RootLayoutOutletContext = {
  setNavLocked: (value: boolean) => void;
  onboardingIncomplete: boolean;
  openOnboardingModal: () => void;
  setLogoClickHandler: (handler: (() => void) | null) => void;
};

const RootLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoaded, user } = useUser();
  const hydrateRole = useAuthStore((state) => state.hydrateRole);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [navLocked, setNavLocked] = useState(false);
  const memberQuery = useAuthMe();
  const onboardingIncomplete = Boolean(user) && memberQuery.data?.isRegistered === false;
  const [logoClickHandler, setLogoClickHandler] = useState<(() => void) | null>(null);
  const isSsoCallbackRoute = location.pathname === '/sso-callback';
  const hideFooterPaths = ['/signup', '/terms/2', '/terms/1'];
  const shouldHideFooter = hideFooterPaths.includes(location.pathname);
  const isReportPage = location.pathname === '/report' || location.pathname === '/';
  const isOnboardingCompleteNow = memberQuery.data?.isRegistered === true;
  const isAuthOnlyRoute =
    location.pathname === '/signup' ||
    location.pathname === '/login' ||
    location.pathname === '/sso-callback';
  const showFloatingChat = Boolean(user) && isOnboardingCompleteNow && !isAuthOnlyRoute;
  const shouldRedirectToSignupImmediately = onboardingIncomplete &&
    !isAuthOnlyRoute && !location.pathname.startsWith('/terms/');

  useLayoutEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  useLayoutEffect(() => {
    const { scrollRestoration } = window.history;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = scrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;

    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    html.scrollTop = 0;
    document.body.scrollTop = 0;
    html.style.scrollBehavior = prevBehavior;
  }, [location.key]);

  useLayoutEffect(() => {
    if (!isLoaded || !memberQuery.data) return;
    const shouldShowModal = sessionStorage.getItem('show_onboarding_modal') === 'true';
    if (!shouldShowModal) return;
    sessionStorage.removeItem('show_onboarding_modal');
    if (!onboardingIncomplete) return;
    setShowOnboardingModal(true);
  }, [isLoaded, memberQuery.data, onboardingIncomplete]);

  useLayoutEffect(() => {
    if (!isLoaded) return;
    const userId = user?.id ?? null;
    setCurrentUserId(userId);
    const storedRole = getStoredUserRole(userId);
    hydrateRole((storedRole as UserRole) ?? null);
  }, [hydrateRole, isLoaded, user?.id]);

  useLayoutEffect(() => {
    if (!onboardingIncomplete || location.pathname === '/signup') {
      setShowOnboardingModal(false);
    }
  }, [onboardingIncomplete, location.pathname]);

  useLayoutEffect(() => {
    if (!isLoaded) return;
    if (!user) return;

    const pathname = location.pathname;
    const isLoginRoute = pathname === '/login';
    if (memberQuery.data && isLoginRoute) {
      navigate(isOnboardingCompleteNow ? '/' : '/signup', { replace: true });
    }
  }, [isLoaded, location.pathname, navigate, user, memberQuery.data, isOnboardingCompleteNow]);

  useEffect(() => {
    document.dispatchEvent(new Event('prerender-ready'));
  }, []);

  const handleLogoClick = () => {
    if (logoClickHandler) {
      logoClickHandler();
      return;
    }
    if (isLoaded && user) {
      if (onboardingIncomplete) {
        setShowOnboardingModal(true);
        return;
      }
    }
    navigate('/');
  };

  // 회원 확인 전에는 하위 화면의 회원 전용 API를 실행하지 않습니다.
  if (!isSsoCallbackRoute && (!isLoaded || (user && memberQuery.isPending))) {
    return <p role="status" className="py-24 text-center text-ui-600">회원 정보를 확인하고 있어요.</p>;
  }

  if (!isSsoCallbackRoute && user && memberQuery.isError) {
    return (
      <div role="alert" className="flex flex-col items-center gap-6 py-24 text-ui-900">
        <p>회원 정보를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.</p>
        <button type="button" disabled={memberQuery.isFetching} onClick={() => void memberQuery.refetch()}
          className="rounded-xl bg-primary px-6 py-3 text-white disabled:opacity-50">
          다시 확인하기
        </button>
      </div>
    );
  }

  if (shouldRedirectToSignupImmediately) {
    return <Navigate to="/signup" replace />;
  }

  return (
    <div className="flex min-h-[100vh] flex-col">
      {!isSsoCallbackRoute && <Header navLocked={navLocked} onLogoClick={handleLogoClick} />}
      <main className="min-h-0 flex-1 py-12">
        <div key={location.key} className="page-transition">
          <Outlet
            context={{
              setNavLocked,
              onboardingIncomplete,
              openOnboardingModal: () => setShowOnboardingModal(true),
              setLogoClickHandler,
            }}
          />
        </div>
      </main>
      {!isSsoCallbackRoute && !shouldHideFooter && (
        <div className={isReportPage ? 'mt-[45vh]' : ''}>
          <Footer />
        </div>
      )}

      {showFloatingChat ? <FloatingProjectCreateCta /> : null}
      {showFloatingChat ? <FloatingChatWidget /> : null}

      {showOnboardingModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-[360px] rounded-[24px] bg-[var(--ui-bg)] px-8 pt-10 pb-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <h2 className="font-semibold text-[18px] text-[var(--ui-900)]">
              회원정보 입력이 필요해요
            </h2>
            <p className="mt-2 text-[13px] text-[var(--ui-400)]">
              계속 사용하려면 회원가입 정보를 입력해 주세요.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowOnboardingModal(false);
                  if (location.pathname !== '/signup') {
                    navigate('/signup');
                  }
                }}
                className="h-[48px] w-full rounded-[12px] bg-[#6654F5] font-semibold text-[16px] text-white"
              >
                회원가입 계속하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RootLayout;
