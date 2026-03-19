import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { Navigate } from 'react-router-dom';

const LOGIN_PROVIDER_KEY = 'login_provider';

const SsoCallbackPage = () => {
  const hasLoginProvider = Boolean(sessionStorage.getItem(LOGIN_PROVIDER_KEY));

  if (!hasLoginProvider) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[var(--ui-bg)] px-6">
        <div className="flex flex-col items-center text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-[18px] font-semibold text-white">로그인을 확인하는 중이에요</p>
          <p className="mt-1 text-[15px] text-[var(--ui-400)]">잠시만 기다려주세요</p>
        </div>
      </div>

      <div className="hidden" aria-hidden="true">
        <AuthenticateWithRedirectCallback />
      </div>
    </>
  );
};

export default SsoCallbackPage;
