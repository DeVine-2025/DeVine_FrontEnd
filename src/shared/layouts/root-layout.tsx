import { useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from '@layouts/footer';
import Header from '@layouts/header';

const RootLayout = () => {
  const location = useLocation();

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
