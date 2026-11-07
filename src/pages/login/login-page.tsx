import BrandLogo from '@assets/images/devine-symbol.png';
import BrandWordmark from '@assets/images/devine-wordmark.png';
import { Gift } from 'lucide-react';
import { useSignIn } from '@clerk/clerk-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import GithubIcon from '@assets/icons/github.svg?react';
import GoogleIcon from '@assets/icons/google.svg?react';
import './login-page.css';

const UNLOCK_TIMEOUT_MS = 10_000; // 10초 후 자동 해제(리다이렉트가 막힌 특이 케이스 대비)

const POST_LOGIN_REDIRECT_KEY = 'post_login_redirect';

type LoginLocationState = {
  postLoginRedirectPath?: string;
};

const LoginPage = () => {
  const { isLoaded, signIn } = useSignIn();
  const location = useLocation();

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

  useEffect(() => {
    const state = location.state as LoginLocationState | null;
    const redirectPath = state?.postLoginRedirectPath;

    if (typeof redirectPath === 'string' && redirectPath.startsWith('/')) {
      sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, redirectPath);
      return;
    }

    sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  }, [location.state]);

  const isAnyLoading = loadingProvider !== null;

  return (
    <div className="login-page">
      <header className="login-header">
        <Link to="/" aria-label="DeVine 홈으로"><img src={BrandWordmark} alt="" /></Link>
      </header>
      <section className="login-content" aria-labelledby="login-title">
        <img src={BrandLogo} alt="DeVine" className="login-logo" />
        <h1 id="login-title">DeVine 시작하기</h1>
        <p className="login-description">코드로 증명하고, 데이터로 연결하다.</p>
        <div className="login-actions">
          <button type="button" onClick={() => void handleOAuthSignIn('github')}
            disabled={!isLoaded || isAnyLoading} aria-busy={loadingProvider === 'github'}
            className="login-provider login-provider--github">
            <GithubIcon aria-hidden="true" />
            {loadingProvider === 'github' ? '로그인 진행 중…' : 'GitHub로 계속하기'}
          </button>
          <button type="button" onClick={() => void handleOAuthSignIn('google')}
            disabled={!isLoaded || isAnyLoading} aria-busy={loadingProvider === 'google'}
            className="login-provider login-provider--google">
            <GoogleIcon aria-hidden="true" />
            {loadingProvider === 'google' ? '로그인 진행 중…' : 'Google로 계속하기'}
          </button>
        </div>
        {isAnyLoading ? (
          <p className="login-note" role="status">로그인 창으로 이동 중입니다. 잠시만 기다려주세요.</p>
        ) : (
          <p className="login-note"><Gift aria-hidden="true" /> GitHub 로그인 시 무료 리포트 1회 제공</p>
        )}
      </section>
    </div>
  );
};

export default LoginPage;
