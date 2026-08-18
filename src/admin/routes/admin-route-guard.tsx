import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ADMIN_AUTH_ME_QUERY_KEY, getAdminMe } from '../apis/auth';

type AdminRouteGuardProps = {
  children: ReactNode;
};

function AdminAccessDenied() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-[20px] px-[24px] text-center">
      <h1 className="Title2 font-semibold text-[var(--ui-1000)]">관리자 접근 권한이 없습니다.</h1>
      <p className="Body1 text-[var(--ui-500)]">관리자 권한이 있는 계정으로 로그인해주세요.</p>
      <Link
        className="Body1 rounded-[8px] bg-[#4e49ff] px-[16px] py-[10px] font-semibold text-white no-underline"
        to="/"
      >
        서비스 홈으로 이동
      </Link>
    </main>
  );
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const location = useLocation();
  const { isError, isPending } = useQuery({
    queryKey: ADMIN_AUTH_ME_QUERY_KEY,
    enabled: isLoaded && isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Clerk token is unavailable.');

      return getAdminMe(token);
    },
    retry: false,
  });

  if (!isLoaded) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="Body1 text-[var(--ui-500)]">로그인 상태를 확인하는 중입니다.</p>
      </main>
    );
  }

  if (!isSignedIn) {
    const postLoginRedirectPath = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate replace state={{ postLoginRedirectPath }} to="/login" />;
  }

  if (isPending) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="Body1 text-[var(--ui-500)]">관리자 권한을 확인하는 중입니다.</p>
      </main>
    );
  }

  if (isError) return <AdminAccessDenied />;

  return children;
}
