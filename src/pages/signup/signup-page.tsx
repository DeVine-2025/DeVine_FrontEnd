import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useAuthMe } from '@hooks/useAuthMe';
import { authMeQueryKey, getAuthMe } from '@apis/auth';
import { useQueryClient } from '@tanstack/react-query';
import AgreementList from './AgreementList';

const LOGIN_PROVIDER_KEY = 'login_provider';
const POST_LOGIN_REDIRECT_KEY = 'post_login_redirect';

const consumePostLoginRedirectPath = () => {
  const path = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
  sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  if (typeof path === 'string' && path.startsWith('/')) {
    return path;
  }
  return '/';
};

const SignupPage = () => {
  const navigate = useNavigate();
  const { isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const { data: memberStatus } = useAuthMe();
  const queryClient = useQueryClient();

  // useState의 lazy initializer는 StrictMode 재마운트에도 값이 보존됨
  const [storedProvider] = useState<'github' | 'google'>(() => {
    const stored = sessionStorage.getItem(LOGIN_PROVIDER_KEY);
    sessionStorage.removeItem(LOGIN_PROVIDER_KEY);
    return stored === 'github' ? 'github' : 'google';
  });

  // 폴백: sessionStorage 값이 유실된 경우 Clerk 외부 계정으로 판별
  const loginProvider = useMemo<'github' | 'google'>(() => {
    if (storedProvider === 'github') return 'github';
    const hasGithub = user?.externalAccounts?.some(
      (acc) => acc.provider === 'github',
    );
    return hasGithub ? 'github' : storedProvider;
  }, [storedProvider, user?.externalAccounts]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      navigate('/', { replace: true });
      return;
    }
    if (memberStatus?.isRegistered === true) {
      navigate(consumePostLoginRedirectPath(), { replace: true });
    }
  }, [isLoaded, navigate, user, memberStatus?.isRegistered]);

  if (memberStatus?.isRegistered === true) {
    return null;
  }

  if (!isLoaded || !memberStatus) {
    return null;
  }

  const handleConfirm = async () => {
    if (!user) return;
    const token = await getToken();
    if (!token) throw new Error('로그인 인증을 확인하지 못했습니다. 다시 시도해 주세요.');
    const registeredMember = await getAuthMe(token);
    if (!registeredMember.isRegistered) {
      throw new Error('회원가입이 완료되지 않았습니다. 다시 시도해 주세요.');
    }
    // Clerk 메타데이터는 보조 정보이며 서버의 회원 등록 여부를 대신하지 않습니다.
    await user.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        onboardingComplete: true,
        loginProvider,
      },
    }).catch(() => undefined);
    queryClient.setQueryData(authMeQueryKey(user.id), registeredMember);
  };

  return (
    <AgreementList
      onConfirm={handleConfirm}
      loginProvider={loginProvider}
    />
  );
};

export default SignupPage;
