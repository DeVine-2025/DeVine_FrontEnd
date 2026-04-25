import { useAuth } from '@clerk/clerk-react';
import LoginRequiredCard from '@ui/LoginRequiredCard';
import SearchTabs from '../search/_components/SearchTabs';
import { Outlet, useLocation } from 'react-router-dom';

const RecommendPage = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();
  const isRecommendProject =
    location.pathname === '/recommend' || location.pathname.endsWith('/recommend/project');
  /** Clerk 복원 전에는 isSignedIn이 false로 잠깐 나오므로 isLoaded 이후에만 판단 */
  const showLoginOverlay = isRecommendProject && isLoaded && !isSignedIn;

  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
      {showLoginOverlay ? (
        <div className="relative min-h-[calc(100vh-6rem)] w-full">
          <div className="min-h-full pointer-events-none select-none blur-sm flex flex-col gap-6">
            <SearchTabs />
            <div>
              <Outlet />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <LoginRequiredCard description="추천 프로젝트를 보려면 로그인해 주세요." />
          </div>
        </div>
      ) : (
        <>
          <SearchTabs />
          <div>
            <Outlet />
          </div>
        </>
      )}
    </section>
  );
};

export default RecommendPage;
