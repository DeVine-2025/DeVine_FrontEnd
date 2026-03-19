import { useUser } from '@clerk/clerk-react';
import Footer from '@layouts/footer';
import Header from '@layouts/header';
import { type UserRole, useAuthStore } from '@store/auth';
import { getStoredUserRole, setCurrentUserId } from '@utils/storage';
import { useLayoutEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

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
  const [onboardingIncomplete, setOnboardingIncomplete] = useState(false);
  const [logoClickHandler, setLogoClickHandler] = useState<(() => void) | null>(null);
  const isSsoCallbackRoute = location.pathname === '/sso-callback';
  const hideFooterPaths = ['/signup', '/terms/service', '/terms/privacy'];
  const shouldHideFooter = hideFooterPaths.includes(location.pathname);

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
    if (!isLoaded) return;
    const shouldShowModal = sessionStorage.getItem('show_onboarding_modal') === 'true';
    if (!shouldShowModal) return;
    sessionStorage.removeItem('show_onboarding_modal');
    const localComplete = (() => {
      try {
        return user?.id ? localStorage.getItem(`onboarding_complete:${user.id}`) === 'true' : false;
      } catch {
        return false;
      }
    })();
    const onboardingComplete = user?.unsafeMetadata?.onboardingComplete === true || localComplete;
    if (onboardingComplete) return;
    setShowOnboardingModal(true);
  }, [isLoaded, user]);

  useLayoutEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setOnboardingIncomplete(false);
      return;
    }

    const localComplete = (() => {
      try {
        return user?.id ? localStorage.getItem(`onboarding_complete:${user.id}`) === 'true' : false;
      } catch {
        return false;
      }
    })();
    const onboardingComplete = user?.unsafeMetadata?.onboardingComplete === true || localComplete;
    setOnboardingIncomplete(!onboardingComplete);
  }, [isLoaded, user]);

  useLayoutEffect(() => {
    if (!isLoaded) return;
    const userId = user?.id ?? null;
    setCurrentUserId(userId);
    const storedRole = getStoredUserRole(userId);
    hydrateRole((storedRole as UserRole) ?? null);
  }, [hydrateRole, isLoaded, user?.id]);

  useLayoutEffect(() => {
    if (!onboardingIncomplete) return;
    const pathname = location.pathname;
    const isSignupRoute = pathname.startsWith('/signup');
    const isLoginRoute = pathname === '/login';
    const isCallbackRoute = pathname === '/sso-callback';
    if (isSignupRoute || isLoginRoute || isCallbackRoute) return;

    const loginProvider = sessionStorage.getItem('login_provider');
    if (pathname === '/' && loginProvider) {
      navigate('/signup', { replace: true });
      return;
    }

    const skipModalOnce = sessionStorage.getItem('skip_onboarding_modal_once') === 'true';
    if (skipModalOnce) {
      sessionStorage.removeItem('skip_onboarding_modal_once');
      return;
    }
    setShowOnboardingModal(true);
  }, [location.pathname, navigate, onboardingIncomplete]);

  useLayoutEffect(() => {
    if (!onboardingIncomplete) {
      setShowOnboardingModal(false);
    }
  }, [onboardingIncomplete]);

  useLayoutEffect(() => {
    if (!isLoaded) return;
    if (!user) return;

    const onboardingComplete = user?.unsafeMetadata?.onboardingComplete === true;
    const pathname = location.pathname;
    const isSignupRoute = pathname === '/signup';
    const isLoginRoute = pathname === '/login';
    if (onboardingComplete && isSignupRoute) {
      navigate('/', { replace: true });
      return;
    }

    if (onboardingComplete && isLoginRoute) {
      navigate('/', { replace: true });
    }
  }, [isLoaded, location.pathname, navigate, user]);

  const handleLogoClick = () => {
    if (logoClickHandler) {
      logoClickHandler();
      return;
    }
    if (isLoaded && user) {
      const onboardingComplete = user?.unsafeMetadata?.onboardingComplete === true;
      if (!onboardingComplete) {
        setShowOnboardingModal(true);
        return;
      }
    }
    navigate('/');
  };

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
      {!isSsoCallbackRoute && !shouldHideFooter && <Footer />}

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
                className="h-[48px] w-full rounded-[12px] bg-[#4E49FF] font-semibold text-[16px] text-white"
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
