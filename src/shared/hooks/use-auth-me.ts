import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { getAuthMe } from '@apis/auth';

export function useAuthMe() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ['authMe'],
    enabled: Boolean(isSignedIn),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return getAuthMe(token);
    },
    staleTime: 60_000,
  });
}
