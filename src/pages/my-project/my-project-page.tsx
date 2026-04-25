import { useAuth } from '@clerk/clerk-react';
import LoginRequiredCard from '@ui/LoginRequiredCard';
import MyProjectTabs from './_components/MyProjectTabs';
import { Outlet } from 'react-router-dom';

export default function MyProjectPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const showLoginGate = isLoaded && !isSignedIn;

  if (showLoginGate) {
    return (
      <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
        <div className="relative min-h-[calc(100vh-6rem)] w-full">
          <div className="min-h-full flex flex-col gap-6 pointer-events-none select-none blur-sm">
            <MyProjectTabs />
            <div>
              <Outlet />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <LoginRequiredCard description="지원 현황을 보려면 로그인해 주세요." />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
      <MyProjectTabs />
      <div>
        <Outlet />
      </div>
    </section>
  );
}
