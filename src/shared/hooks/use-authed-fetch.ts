import { useAuth } from '@clerk/clerk-react';

function useAuthedFetch() {
  const { getToken } = useAuth();

  return async (input: RequestInfo, init: RequestInit = {}) => {
    const token = await getToken();
    const url = typeof input === 'string' ? input : input.url;
    const method = init.method ?? 'GET';
    console.log('[useAuthedFetch]', { url, method, hasToken: Boolean(token) });
    return fetch(input, {
      ...init,
      headers: {
        ...(init.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };
}

export { useAuthedFetch };
