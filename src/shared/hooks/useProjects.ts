import type { GetProjectsParams } from '@apis/projects';
import { getProjects } from '@apis/projects';
import { useAuth } from '@clerk/clerk-react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useProjects(params: GetProjectsParams | string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['projects', params],
    enabled: !!params,
    queryFn: async ({ signal }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token');
      return getProjects(params, token, signal);
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
