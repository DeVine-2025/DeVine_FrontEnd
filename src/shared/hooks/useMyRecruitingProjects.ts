import {
  getMyProjectsAllStatuses,
  type MyRecruitingProjectItem,
} from '@apis/projects';
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';

const MY_RECRUITING_PROJECTS_QUERY_KEY = ['myRecruitingProjects'] as const;

export function useMyRecruitingProjects(options?: { enabled?: boolean }) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: MY_RECRUITING_PROJECTS_QUERY_KEY,
    queryFn: async ({ signal }): Promise<MyRecruitingProjectItem[]> => {
      const token = await getToken();
      if (!token) return [];
      return getMyProjectsAllStatuses(token, signal);
    },
    enabled: options?.enabled ?? isSignedIn ?? false,
    staleTime: 60_000,
  });
}

export { MY_RECRUITING_PROJECTS_QUERY_KEY };
