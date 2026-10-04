import { getTechstacks } from '@apis/techstacks';
import { BASE_URL } from '@constants/endpoints';
import { useQuery } from '@tanstack/react-query';

export const TECHSTACKS_QUERY_KEY = ['techstacks', 'catalog', BASE_URL] as const;

export function useTechstacks() {
  return useQuery({
    queryKey: TECHSTACKS_QUERY_KEY,
    queryFn: getTechstacks,
    staleTime: 1000 * 60 * 10,
  });
}

