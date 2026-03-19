import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

const LOGIN_PROVIDER_KEY = 'login_provider';

const SsoCallbackPage = () => {
  const hasLoginProvider = Boolean(sessionStorage.getItem(LOGIN_PROVIDER_KEY));

  if (!hasLoginProvider) {
    return <Navigate to="/" replace />;
  }

  return <AuthenticateWithRedirectCallback />;
};

export default SsoCallbackPage;
