import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { AuthMeError, authMeQueryKey, getAuthMe } from '@apis/auth';

export function useAuthMe() {
  const { getToken, isSignedIn, isLoaded, userId } = useAuth();

  return useQuery({
    queryKey: authMeQueryKey(userId),
    enabled: isLoaded && isSignedIn === true && Boolean(userId),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new AuthMeError('로그인 인증을 확인하지 못했습니다. 다시 시도해 주세요.', 401);
      return getAuthMe(token);
    },
    staleTime: 60_000,
    retry: (failureCount, error) =>
      !(error instanceof AuthMeError && error.status >= 400 && error.status < 500) && failureCount < 1,
  });
}
