import { useAuth } from '@clerk/clerk-react';
import LoginRequiredCard from '@components/common/LoginRequiredCard';
import { Outlet, useLocation } from 'react-router-dom';

const ReportMainPage = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();
  const fullWidthReport = location.pathname.startsWith('/report/detail/');
  // const { search } = useLocation();
  // const isOthersReport = search.includes('isOwner=others');
  const showLoginGate = isLoaded && !isSignedIn;
  const alignDesktopContent = fullWidthReport || /^\/report\/?$/.test(location.pathname);
  const contentWidth = alignDesktopContent ? 'desktop-content w-[var(--desktop-content-width,100%)]' : 'w-full';

  if (showLoginGate) {
    return (
      <div className="flex h-full flex-col">
        <section className={`mx-auto flex min-h-0 ${contentWidth} flex-1 flex-col gap-6 ${fullWidthReport ? 'max-w-none' : alignDesktopContent ? 'max-w-[1180px] lg:max-2xl:max-w-[clamp(940px,76vw,1150px)]' : 'max-w-[1180px]'}`}>
          <div className="relative min-h-[calc(100vh-6rem)] w-full">
            <div className="min-h-full pointer-events-none select-none blur-sm flex flex-col">
              <Outlet />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <LoginRequiredCard description="리포트를 보려면 로그인해 주세요." />
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <section className={`mx-auto flex min-h-0 ${contentWidth} flex-1 flex-col gap-6 ${fullWidthReport ? 'max-w-none' : alignDesktopContent ? 'max-w-[1180px] lg:max-2xl:max-w-[clamp(940px,76vw,1150px)]' : 'max-w-[1180px]'}`}>
        <Outlet />
      </section>
    </div>
  );
};

export default ReportMainPage;
