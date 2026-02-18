import { getDevelopers } from '@apis/developer';
import { useAuth } from '@clerk/clerk-react';
import type { GetDevelopersParams } from '@t/profileCard.types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useDevelopers(params: GetDevelopersParams) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['developers', params],
    queryFn: async ({ signal }) => {
      const token = await getToken();
      return getDevelopers(params, token, signal);
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
