import { useAuth } from '@clerk/clerk-react';
import queryClient from '@libs/query-client';
import { router } from '@routes/routers';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

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
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkTokenLogger />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
