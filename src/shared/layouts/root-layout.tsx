import { useLayoutEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Footer from '@layouts/footer';
import Header from '@layouts/header';

const RootLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoaded, user } = useUser();

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
    if (!user) return;

    const onboardingComplete = user?.unsafeMetadata?.onboardingComplete === true;
    const pathname = location.pathname;
    const isSignupRoute = pathname === '/signup';
    const isCallbackRoute = pathname === '/sso-callback';
    const isLoginRoute = pathname === '/login';
    const isMainRoute = pathname === '/';

    if (!onboardingComplete && !isSignupRoute && !isCallbackRoute && !isLoginRoute && !isMainRoute) {
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
    </div>
  );
};

export default RootLayout;
