import { createQueryClient } from '@libs/query-client';
import { router } from '@routes/routers';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { setTokenGetter } from '@apis/instance';

function App() {
  const { getToken, userId } = useAuth();

  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  return <AccountQueryScope key={userId ?? 'guest'} />;
}

function AccountQueryScope() {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
