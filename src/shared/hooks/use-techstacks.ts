import { getTechstacks } from '@apis/techstacks';
import { useQuery } from '@tanstack/react-query';

export const TECHSTACKS_QUERY_KEY = ['techstacks', 'catalog'] as const;

export function useTechstacks() {
  return useQuery({
    queryKey: TECHSTACKS_QUERY_KEY,
    queryFn: getTechstacks,
    staleTime: 1000 * 60 * 10,
  });
}

