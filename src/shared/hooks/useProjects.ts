import { type GetProjectsParams, getProjects } from '@apis/projects';
import { useAuth } from '@clerk/clerk-react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useProjects(params: GetProjectsParams) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['projects', params],
    queryFn: async ({ signal }) => {
      const token = await getToken();
      // console.log(token);
      if (!token) throw new Error('No auth token');
      // console.log(params); // 요청
      return getProjects(params, token, signal);
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
