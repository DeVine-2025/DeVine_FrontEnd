import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import AgreementList from './AgreementList';

const LOGIN_PROVIDER_KEY = 'login_provider';

const SignupPage = () => {
  const navigate = useNavigate();
  const { isLoaded, user } = useUser();

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
    if (user?.unsafeMetadata?.onboardingComplete) {
      navigate('/', { replace: true });
    }
  }, [isLoaded, navigate, user]);

  if (!isLoaded) {
    return null;
  }

  const handleConfirm = async () => {
    if (!user) return;
    await user.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        onboardingComplete: true,
        loginProvider,
      },
    });
    // TODO: 백엔드에 회원 등록 API가 있으면 여기서 호출 필요 (예: POST /api/v1/members).
    // 호출하지 않으면 프로젝트 등록 시 "가입되지 않은 사용자" 오류가 발생할 수 있음.
  };

  return (
    <AgreementList
      onClose={() => navigate('/login')}
      onConfirm={handleConfirm}
      loginProvider={loginProvider}
    />
  );
};

export default SignupPage;
