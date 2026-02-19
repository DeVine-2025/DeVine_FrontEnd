import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';

export type DevTab = 'suggested' | 'applied';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

const ENDPOINT_BY_TAB: Record<DevTab, string> = {
  suggested: '/api/v1/matching/pm/proposed-developers',
  applied: '/api/v1/matching/pm/applications',
};

export type MatchingDeveloper = {
  matchingId: number;
  projectId: number;
  projectName: string;
  developerId: number;
  developerNickname: string;
  developerImageUrl: string | null;
  part: string;
  partName: string;
  categories: { genre: string; displayName: string }[];
  techStacks: string[];
  body: string | null;
  matchingType: string;
  decision: string;
  createdAt: string;
};

export type Page<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

type ApiResponse<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

const EMPTY = { content: [], totalElements: 0 } as const;

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

async function fetchPmDevelopers({
  endpoint,
  token,
  signal,
}: {
  endpoint: string;
  token: string;
  signal?: AbortSignal;
}) {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set');

  const url = joinUrl(API_BASE_URL, endpoint);

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (res.status === 404 || res.status === 204) return EMPTY;
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

    const json = (await res.json()) as ApiResponse<{ developers: Page<MatchingDeveloper> }>;
    return json.result.developers;
  } catch (e: any) {
    if (e?.name === 'AbortError') return EMPTY;
    throw e;
  }
}

export function usePmDevelopers(tab: DevTab) {
  const { getToken } = useAuth();
  const endpoint = ENDPOINT_BY_TAB[tab];

  return useQuery({
    queryKey: ['pm-developers', tab],
    queryFn: async ({ signal }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token');
      return fetchPmDevelopers({ endpoint, token, signal });
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
