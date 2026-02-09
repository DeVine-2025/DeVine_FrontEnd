import queryClient from '@libs/query-client';
import { router } from '@routes/routers';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { setTokenGetter } from '@apis/instance';

function ClerkTokenLogger() {
  const { isSignedIn, getToken } = useAuth();
  useEffect(() => {
    if (!isSignedIn) return;
    getToken().then((token) => {
      console.log('[Clerk token]', token);
    });
  }, [isSignedIn, getToken]);
  return null;
}

function App() {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  return (
    <QueryClientProvider client={queryClient}>
      <ClerkTokenLogger />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
