import { useSignIn } from '@clerk/clerk-react';
import { useEffect, useRef, useState } from 'react';
import GithubIcon from '@assets/icons/github.svg?react';
import GoogleIcon from '@assets/icons/google.svg?react';
import LogoDark from '@assets/icons/logo-dark.svg?react';
import LogoLight from '@assets/icons/logo-light.svg?react';
import { useThemeStore } from '@store/theme';

const UNLOCK_TIMEOUT_MS = 10_000; // 10초 후 자동 해제(리다이렉트가 막힌 특이 케이스 대비)

const LoginPage = () => {
  const { isLoaded, signIn } = useSignIn();
  const { theme } = useThemeStore();

  // UI용: 어떤 provider로 진행 중인지
  const [loadingProvider, setLoadingProvider] = useState<'github' | 'google' | null>(null);

  // 로직용: 1회 실행 보장 락
  const inFlightRef = useRef(false);

  // 타임아웃 핸들 저장 (중복 setTimeout 방지/정리)
  const unlockTimerRef = useRef<number | null>(null);

  const clearUnlockTimer = () => {
    if (unlockTimerRef.current !== null) {
      window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }
  };

  const lock = (provider: 'github' | 'google') => {
    inFlightRef.current = true;
    setLoadingProvider(provider);

    // 타임아웃 중복 방지
    clearUnlockTimer();

    // 리다이렉트가 안 일어나는 경우를 대비해 자동 복구
    unlockTimerRef.current = window.setTimeout(() => {
      inFlightRef.current = false;
      setLoadingProvider(null);
      unlockTimerRef.current = null;
    }, UNLOCK_TIMEOUT_MS);
  };

  const unlock = () => {
    inFlightRef.current = false;
    setLoadingProvider(null);
    clearUnlockTimer();
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    if (!isLoaded || !signIn) return;

    // 이미 진행 중이면 추가 클릭 무시
    if (inFlightRef.current) return;

    lock(provider);

    try {
      const strategy = provider === 'github' ? 'oauth_github' : 'oauth_google';
      sessionStorage.setItem('login_provider', provider);

      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/signup',
      });

      // 보통 여기서 리다이렉트가 발생함
      // (리다이렉트가 정상 동작하면 페이지가 이동하므로 unlock이 굳이 필요 없지만,
      // 혹시 이동이 지연/차단되면 위 타임아웃이 자동 복구해줌)
    } catch (e) {
      // 실패하면 즉시 복구
      unlock();
      console.error(e);
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => clearUnlockTimer();
  }, []);

  const isAnyLoading = loadingProvider !== null;

  return (
    <div className="bg-[var(--color-auth-bg)] text-[var(--color-auth-text)]">
      <main className="mx-auto flex min-h-screen w-full max-w-[360px] -mt-12 flex-col items-center justify-center px-6 text-center sm:max-w-[600px] sm:px-10 lg:max-w-[1200px] lg:px-16">
        <div className="mb-4 -mt-24 flex items-center justify-center">
          {theme === 'dark' ? (
            <LogoLight className="h-30 w-auto" aria-hidden="true" />
          ) : (
            <LogoDark className="h-30 w-auto" aria-hidden="true" />
          )}
        </div>

        <p className="-mt-4 w-full max-w-[320px] text-[16px] leading-[24px] text-[var(--color-auth-desc)] sm:max-w-[600px] font-semibold">
          코드로 증명하고, 데이터로 연결하다.
          <br />
          사이드 프로젝트 매칭 플랫폼
        </p>

        <div className="mt-30 flex w-full max-w-[360px] flex-col gap-3 font-semibold text-[16px] sm:max-w-[420px]">
          <button
            type="button"
            onClick={() => void handleOAuthSignIn('github')}
            disabled={!isLoaded || isAnyLoading}
            aria-busy={loadingProvider === 'github'}
            className={`relative flex h-[48px] w-full items-center justify-center gap-4 rounded-[12px] px-4 overflow-visible whitespace-nowrap bg-[var(--color-auth-btn-dark-bg)] text-[var(--color-auth-btn-dark-text)]
              ${isAnyLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <span className="pointer-events-none absolute -top-16 left-[110%] -translate-x-1/2 rounded-full rounded-bl-[6px] bg-[var(--badge-bg-primary)] px-6 py-2 text-[14px] font-semibold text-[var(--badge-text-primary)] shadow-[0_3px_14px_rgba(78,73,255,0.1)]">
              깃허브 로그인 시 1회 무료 리포트 생성
            </span>
            <GithubIcon className="h-9 w-9" aria-hidden="true" />
            {loadingProvider === 'github' ? '로그인 진행 중…' : '깃허브 계정으로 계속하기'}
          </button>

          <button
            type="button"
            onClick={() => void handleOAuthSignIn('google')}
            disabled={!isLoaded || isAnyLoading}
            aria-busy={loadingProvider === 'google'}
            className={`flex h-[48px] w-full items-center justify-center gap-4 rounded-[12px] px-4 whitespace-nowrap bg-[var(--color-auth-btn-light-bg)] text-[var(--color-auth-btn-light-text)] border border-[var(--color-auth-btn-light-border)]
              ${isAnyLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <GoogleIcon className="h-7 w-7" aria-hidden="true" />
            {loadingProvider === 'google' ? '로그인 진행 중…' : '구글 계정으로 계속하기'}
          </button>

          {/* 진행 중 안내 문구 */}
          {isAnyLoading && (
            <p className="mt-2 text-[12px] text-[var(--color-auth-desc)]">
              로그인 창으로 이동 중입니다. 잠시만 기다려주세요.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default LoginPage;