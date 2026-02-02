import { type GetProjectsParams, getProjects } from '@apis/projects';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useProjects(params: GetProjectsParams) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: ({ signal }) => getProjects(params, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
