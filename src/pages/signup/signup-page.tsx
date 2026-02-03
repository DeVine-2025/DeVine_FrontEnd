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
