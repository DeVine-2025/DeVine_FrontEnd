import { type RespondDecision, respondProposal } from '@apis/matching';
import { useAuth } from '@clerk/clerk-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { DevTab } from './useDevProjects';

export function useRespondProposal() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: { matchingId: number; decision: RespondDecision; tab: DevTab }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token');
      return respondProposal(params.matchingId, params.decision, token);
    },

    onSuccess: (_res, vars) => {
      qc.setQueryData(['dev-projects', vars.tab], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          content: (old.content ?? []).map((item: any) =>
            item.matchingId === vars.matchingId ? { ...item, decision: vars.decision } : item,
          ),
        };
      });

      qc.invalidateQueries({ queryKey: ['dev-projects', vars.tab] });
    },
  });
}
