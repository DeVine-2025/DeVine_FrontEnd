import { useAuth } from '@clerk/clerk-react';
import { useInfiniteQuery } from '@tanstack/react-query';

export type DevTab = 'suggested' | 'applied';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ENDPOINT_BY_TAB: Record<DevTab, string> = {
  suggested: '/api/v1/matching/developer/received-proposals',
  applied: '/api/v1/matching/developer/applications',
};

export type MatchingProject = {
  matchingId: number;
  projectId: number;
  projectName: string;
  decision?: 'PENDING' | 'ACCEPT' | 'REJECT' | string;
  createdAt?: string;
  categoryName?: string;
  thumbnailUrl?: string | null;
  modeName?: string;
  durationRangeName?: string;
  content?: string;
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

async function fetchDevProjects(args: { endpoint: string; token: string; page: number; signal?: AbortSignal }) {
  const { endpoint, token, page, signal } = args;
  const url = `${API_BASE_URL}${endpoint}?page=${page}`;

  const res = await fetch(url, {
    method: 'GET',
    signal,
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

  const json = (await res.json()) as ApiResponse<{
    projects: Page<MatchingProject>;
  }>;

  return json.result.projects;
}

export function useDevProjects(tab: DevTab) {
  const { getToken } = useAuth();
  const endpoint = ENDPOINT_BY_TAB[tab];

  return useInfiniteQuery({
    queryKey: ['dev-projects', tab],
    initialPageParam: 0,
    getNextPageParam: (lastPage: Page<MatchingProject>, _pages, lastPageParam) =>
      lastPage.last || lastPageParam + 1 >= lastPage.totalPages ? undefined : lastPageParam + 1,
    queryFn: async ({ signal, pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token');
      return fetchDevProjects({ endpoint, token, page: pageParam, signal });
    },
    staleTime: 30_000,
  });
}
