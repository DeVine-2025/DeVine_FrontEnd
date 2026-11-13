/** QA 목데이터는 정확한 QA 호스트에서만 허용한다. 운영 호스트에서는 항상 실제 API를 사용한다. */
export function resolveMockData(isDevelopment: boolean, hostname: string, mode?: string): boolean {
  return (isDevelopment || hostname === 'qa.devine.kr') && mode !== 'api';
}

/** 로컬·QA는 목데이터가 기본이며, VITE_DATA_MODE=api로 실제 API를 확인한다. */
export const useMockData = resolveMockData(
  import.meta.env.DEV,
  typeof window === 'undefined' ? '' : window.location.hostname,
  import.meta.env.VITE_DATA_MODE,
);
