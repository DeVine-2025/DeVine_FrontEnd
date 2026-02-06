import { useSignIn } from '@clerk/clerk-react';
import GithubIcon from '@assets/icons/github.svg?react';
import GoogleIcon from '@assets/icons/google.svg?react';

const LoginPage = () => {
  const { isLoaded, signIn } = useSignIn();

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
      <main className="mx-auto flex min-h-screen w-full max-w-[360px] flex-col items-center justify-center px-6 text-center sm:max-w-[600px] sm:px-10 lg:max-w-[1200px] lg:px-16">
        <h1 className="Title2 font-bold text-[var(--color-auth-text)]">Devine 한줄소개</h1>
        <p className="mt-15 w-full max-w-[320px] text-[16px] leading-[24px] text-[var(--color-auth-desc)] sm:max-w-[600px]">
          Devine 설명이 들어가는 자리입니다.
          <br />
          Devine 설명이 들어가는 자리입니다.
          <br />
          Devine 설명이 들어가는 자리입니다.
        </p>
        <div className="mt-30 flex w-full max-w-[360px] flex-col gap-3 font-semibold text-[16px] sm:max-w-[420px]">
          <button
            type="button"
            onClick={() => void handleOAuthSignIn('github')}
            className="relative flex h-[48px] w-full items-center justify-center gap-4 rounded-[12px] px-4 overflow-visible whitespace-nowrap bg-[var(--color-auth-btn-dark-bg)] text-[var(--color-auth-btn-dark-text)]"
          >
            <span className="absolute -top-13 right-0 translate-x-[50%] drop-shadow-sm">
              <span className="absolute bottom-2 left-[60%] h-15 w-5 -translate-x-1/2 translate-y-1/2 rotate-70 bg-[var(--color-auth-accent,#ffcc00)]" />
              <span className="relative z-10 rounded-full bg-[var(--color-auth-accent,#ffcc00)] px-2 py-[2px] text-[11px] font-semibold leading-none text-[#1a1a1a]">
                1회 무료 리포트 제공
              </span>
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

