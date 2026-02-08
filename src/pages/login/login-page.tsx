import { useSignIn } from '@clerk/clerk-react';
import GithubIcon from '@assets/icons/github.svg?react';
import GoogleIcon from '@assets/icons/google.svg?react';
import LogoDark from '@assets/icons/logo-dark.svg?react';
import LogoLight from '@assets/icons/logo-light.svg?react';
import { useThemeStore } from '@store/theme';

const LoginPage = () => {
  const { isLoaded, signIn } = useSignIn();
  const { theme } = useThemeStore();

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    if (!isLoaded) return;

    const strategy = provider === 'github' ? 'oauth_github' : 'oauth_google';
    sessionStorage.setItem('login_provider', provider);
    await signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/',
    });
  };

  return (
    <div className="bg-[var(--color-auth-bg)] text-[var(--color-auth-text)]">
      <main className="mx-auto flex min-h-screen w-full max-w-[360px] -mt-12 flex-col items-center justify-center px-6 text-center sm:max-w-[600px] sm:px-10 lg:max-w-[1200px] lg:px-16">
        <div className="mb-6 -mt-14 flex items-center justify-center pl-100">
          {theme === 'dark' ? (
            <LogoDark className="h-30 w-auto" aria-hidden="true" />
          ) : (
            <LogoLight className="h-30 w-auto" aria-hidden="true" />
          )}
        </div>
        <p className="mt-1 w-full max-w-[320px] text-[16px] leading-[24px] text-[var(--color-auth-desc)] sm:max-w-[600px]">
          코드로 증명하고, 데이터로 연결하다.
          <br />
          사이드 프로젝트 매칭 플랫폼
        </p>
        <div className="mt-30 flex w-full max-w-[360px] flex-col gap-3 font-semibold text-[16px] sm:max-w-[420px]">
          <button
            type="button"
            onClick={() => void handleOAuthSignIn('github')}
            className="relative flex h-[48px] w-full items-center justify-center gap-4 rounded-[12px] px-4 overflow-visible whitespace-nowrap bg-[var(--color-auth-btn-dark-bg)] text-[var(--color-auth-btn-dark-text)]"
          >
            <span
              className={`pointer-events-none absolute -top-16 left-[110%] -translate-x-1/2 rounded-full rounded-bl-[6px] px-6 py-2 text-[14px] font-semibold shadow-[0_3px_14px_rgba(78,73,255,0.1)] ${
                theme === 'light' ? 'bg-[#EEEDFF] text-[#4E49FF]' : 'bg-[#1E1D4D] text-[#7E7AFF]'
              }`}
            >
              깃허브 로그인 시 1회 무료 리포트 생성
            </span>
            <GithubIcon className="h-9 w-9" aria-hidden="true" />
            깃허브 계정으로 계속하기
          </button>
          <button
            type="button"
            onClick={() => void handleOAuthSignIn('google')}
            className="flex h-[48px] w-full items-center justify-center gap-4 rounded-[12px] px-4 whitespace-nowrap bg-[var(--color-auth-btn-light-bg)] text-[var(--color-auth-btn-light-text)] border border-[var(--color-auth-btn-light-border)]"
          >
            <GoogleIcon className="h-7 w-7" aria-hidden="true" />
            구글 계정으로 계속하기
          </button>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

