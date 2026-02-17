import { getRecommendMembersPreview } from '@apis/recommendMembers';
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';

export function useRecommendMembersPreview(projectId: number | null, limit = 4) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['recommendMembersPreview', projectId, limit],
    enabled: projectId != null,
    queryFn: async ({ signal }) => {
      const token = await getToken();
      if (!token || projectId == null) return [];
      return getRecommendMembersPreview(projectId, limit, token, signal);
    },
    staleTime: 30_000,
  });
}
