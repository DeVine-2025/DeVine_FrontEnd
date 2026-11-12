/** 개발 중에는 목데이터를 기본으로 사용하며 VITE_DATA_MODE=api로 실제 API를 확인한다. */
export const useMockData = import.meta.env.DEV && import.meta.env.VITE_DATA_MODE !== 'api';
