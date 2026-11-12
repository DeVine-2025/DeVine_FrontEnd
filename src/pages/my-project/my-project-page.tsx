import { useAuth } from '@clerk/clerk-react';
import LoginRequiredCard from '@components/common/LoginRequiredCard';
import MyProjectTabs from '@components/tab/MyProjectTabs';
import { Outlet } from 'react-router-dom';

export default function MyProjectPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const showLoginGate = isLoaded && !isSignedIn;

  if (showLoginGate) {
    return (
      <section className="mx-auto flex desktop-content w-[var(--desktop-content-width,100%)] max-w-[1040px] lg:max-2xl:max-w-[clamp(880px,73vw,1020px)] flex-col gap-6">
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
    <section className="mx-auto flex desktop-content w-[var(--desktop-content-width,100%)] max-w-[1120px] lg:max-2xl:max-w-[clamp(920px,75vw,1090px)] flex-col gap-[20px] lg:max-2xl:gap-[16px] px-[16px] sm:px-[24px]">
      <header className="pt-2">
        <h1 className="text-[30px] font-bold tracking-tight text-[var(--text-main)]">지원 현황</h1>
        <p className="mt-[8px] text-[15px] leading-relaxed text-[var(--text-secondary)]">받은 지원과 제안에 응답하고, 보낸 내역의 결과를 확인하세요.</p>
      </header>
      <MyProjectTabs />
      <div>
        <Outlet />
      </div>
    </section>
  );
}
