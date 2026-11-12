import { type RespondDecision, respondProposal } from '@apis/matching';
import { useAuth } from '@clerk/clerk-react';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MatchingProject, Page } from './useDevProjects';

export function useRespondProposal() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['dev-projects', 'suggested'];

  return useMutation({
    mutationFn: async ({ matchingId, decision }: { matchingId: number; decision: RespondDecision }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token');
      const result = await respondProposal(matchingId, decision, token);
      if (result?.isSuccess === false) throw new Error(result.message);
    },
    onSuccess: async (_result, { matchingId, decision }) => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<InfiniteData<Page<MatchingProject>>>(queryKey, (previous) => previous && ({
        ...previous,
        pages: previous.pages.map((page) => ({
          ...page,
          content: page.content.map((item) => item.matchingId === matchingId ? { ...item, decision } : item),
        })),
      }));
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}
