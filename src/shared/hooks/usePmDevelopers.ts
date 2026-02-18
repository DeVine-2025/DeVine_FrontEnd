import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';

export type DevTab = 'suggested' | 'applied';

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

async function fetchPmDevelopers({
  endpoint,
  token,
  signal,
}: {
  endpoint: string;
  token: string;
  signal?: AbortSignal;
}) {
  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      signal,
      headers: { Authorization: `Bearer ${token}` },
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
