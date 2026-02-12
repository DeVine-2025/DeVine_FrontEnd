import { type RespondDecision, respondApplication } from '@apis/matching';
import { useAuth } from '@clerk/clerk-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type PmDevelopersResponse = {
  content: Array<{ matchingId: number; status: 'PENDING' | 'ACCEPT' | 'REJECT' }>;
  totalElements: number;
};

export function useRespondApplication() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: { matchingId: number; decision: RespondDecision }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token');
      return respondApplication(params.matchingId, params.decision, token);
    },

    onMutate: async ({ matchingId, decision }) => {
      await qc.cancelQueries({ queryKey: ['pmDevelopers'] });

      const prevApplied = qc.getQueryData<PmDevelopersResponse>(['pmDevelopers', 'applied']);
      const prevSuggested = qc.getQueryData<PmDevelopersResponse>(['pmDevelopers', 'suggested']);

      const patch = (prev?: PmDevelopersResponse) => {
        if (!prev) return prev;
        return {
          ...prev,
          content: prev.content.map((it) =>
            it.matchingId === matchingId ? { ...it, status: decision } : it,
          ),
        };
      };

      qc.setQueryData(['pmDevelopers', 'applied'], patch(prevApplied));
      qc.setQueryData(['pmDevelopers', 'suggested'], patch(prevSuggested));

      return { prevApplied, prevSuggested };
    },

    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      qc.setQueryData(['pmDevelopers', 'applied'], ctx.prevApplied);
      qc.setQueryData(['pmDevelopers', 'suggested'], ctx.prevSuggested);
    },

    onSuccess: (res) => {
      const { matchingId, status } = res.result;

      const applyServer = (prev?: PmDevelopersResponse) => {
        if (!prev) return prev;
        return {
          ...prev,
          content: prev.content.map((it) =>
            it.matchingId === matchingId ? { ...it, status } : it,
          ),
        };
      };

      qc.setQueryData(['pmDevelopers', 'applied'], applyServer);
      qc.setQueryData(['pmDevelopers', 'suggested'], applyServer);
    },

    onSettled: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['pmDevelopers', 'applied'] }),
        qc.invalidateQueries({ queryKey: ['pmDevelopers', 'suggested'] }),
      ]);
    },
  });
}
