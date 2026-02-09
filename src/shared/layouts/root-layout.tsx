import { useLayoutEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Footer from '@layouts/footer';
import Header from '@layouts/header';

const RootLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoaded, user } = useUser();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

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
    const shouldShowModal = sessionStorage.getItem('show_onboarding_modal') === 'true';
    if (!shouldShowModal) return;
    sessionStorage.removeItem('show_onboarding_modal');
    setShowOnboardingModal(true);
    if (location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  useLayoutEffect(() => {
    if (!isLoaded) return;
    if (!user) return;

    const onboardingComplete = user?.unsafeMetadata?.onboardingComplete === true;
    const pathname = location.pathname;
    const isSignupRoute = pathname === '/signup';
    const isCallbackRoute = pathname === '/sso-callback';
    const isLoginRoute = pathname === '/login';
    if (!onboardingComplete && !isSignupRoute && !isCallbackRoute && !isLoginRoute) {
      const skipModalOnce = sessionStorage.getItem('skip_onboarding_modal_once') === 'true';
      if (skipModalOnce) {
        sessionStorage.removeItem('skip_onboarding_modal_once');
        return;
      }
      navigate('/signup', { replace: true });
      return;
    }

    if (onboardingComplete && isSignupRoute) {
      navigate('/', { replace: true });
      return;
    }

    if (onboardingComplete && isLoginRoute) {
      navigate('/', { replace: true });
    }
  }, [isLoaded, location.pathname, navigate, user]);

  return (
    <div className="flex min-h-[100vh] flex-col">
      <Header />
      <main className="min-h-0 flex-1 py-12">
        <Outlet />
      </main>
      <Footer />

      {showOnboardingModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-[360px] rounded-[24px] bg-[var(--ui-bg)] px-8 pb-8 pt-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <h2 className="text-[18px] font-semibold text-[var(--ui-900)]">
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
                  navigate('/signup');
                }}
                className="h-[48px] w-full rounded-[12px] bg-[#4E49FF] text-[16px] font-semibold text-white"
              >
                회원가입 계속하기
              </button>
              <button
                type="button"
                onClick={() => setShowOnboardingModal(false)}
                className="text-[14px] text-[var(--ui-400)]"
              >
                나중에 하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RootLayout;
