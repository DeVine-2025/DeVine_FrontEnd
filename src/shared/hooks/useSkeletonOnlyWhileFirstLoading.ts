import { useCallback, useRef } from 'react';

/**
 * 목록 refetch 시에는 스켈레톤을 숨기고, 마운트 후 첫 페칭이 끝나기 전에만 표시합니다.
 */
export function useSkeletonOnlyWhileFirstLoading() {
  const firstFetchSettledRef = useRef(false);

  const markFirstFetchSettled = useCallback(() => {
    firstFetchSettledRef.current = true;
  }, []);

  const shouldShowFetchingSkeleton = useCallback((isLoading: boolean) => {
    return isLoading && !firstFetchSettledRef.current;
  }, []);

  return { markFirstFetchSettled, shouldShowFetchingSkeleton };
}
