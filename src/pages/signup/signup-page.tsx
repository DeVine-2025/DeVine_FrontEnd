import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import AgreementList from './AgreementList';

const LOGIN_PROVIDER_KEY = 'login_provider';

const SignupPage = () => {
  const navigate = useNavigate();
  const { isLoaded, user } = useUser();

  const loginProvider = useMemo(() => {
    const stored = sessionStorage.getItem(LOGIN_PROVIDER_KEY);
    return stored === 'github' ? 'github' : 'google';
  }, []);

  useEffect(() => {
    sessionStorage.removeItem(LOGIN_PROVIDER_KEY);
  }, []);

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
