import { useCallback, useEffect, useRef, useState } from 'react';

/** 추천·검색 등 목록 스켈레톤 최소 표시 시간(ms). 한 곳만 바꾸면 전역과 동일하게 적용됩니다. */
export const INITIAL_SKELETON_MIN_MS = 3000;

const STORAGE_PREFIX = 'devine_initial_skeleton:';

export type InitialSkeletonGateOptions = {
  minMs?: number;
  /**
   * 지정 시 `sessionStorage`에 완료 여부를 저장합니다.
   * 같은 탭에서 한 번 끝난 뒤(새로고침 포함)에는 스켈레톤을 쓰지 않습니다.
   */
  sessionKey?: string;
};

function normalizeOptions(second?: number | InitialSkeletonGateOptions): {
  minMs: number;
  sessionKey?: string;
} {
  if (second == null) return { minMs: INITIAL_SKELETON_MIN_MS };
  if (typeof second === 'number') return { minMs: second };
  return {
    minMs: second.minMs ?? INITIAL_SKELETON_MIN_MS,
    sessionKey: second.sessionKey,
  };
}

function readSessionDone(storageKey: string | null): boolean {
  if (!storageKey) return false;
  try {
    return globalThis.sessionStorage?.getItem(storageKey) === '1';
  } catch {
    return false;
  }
}

/** `useInitialSkeletonGate(..., { sessionKey })`와 동일 키로 이미 완료됐는지 확인 (강제 스켈레톤 OR 조건 등에서 사용) */
export function isInitialSkeletonSessionDone(sessionKey: string): boolean {
  return readSessionDone(`${STORAGE_PREFIX}${sessionKey}`);
}

/**
 * 첫 진입(해당 탭에서 `sessionKey` 미완료 시): `isLoading` 동안 + 끝난 뒤 최소 `minMs` 스켈레톤 유지.
 * 같은 탭에서 한 번 완료되거나 새로고침 후에는 스켈레톤 미사용. refetch 시에도 스켈레톤 미사용.
 */
export function useInitialSkeletonGate(
  isLoading: boolean,
  second?: number | InitialSkeletonGateOptions,
) {
  const { minMs, sessionKey } = normalizeOptions(second);
  const storageKey = sessionKey ? `${STORAGE_PREFIX}${sessionKey}` : null;

  const [skipFromSession] = useState(() => readSessionDone(storageKey));

  const phaseCompleteRef = useRef(skipFromSession);
  const windowStartRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(() => !skipFromSession && isLoading);

  const persistDone = useCallback(() => {
    if (!storageKey) return;
    try {
      globalThis.sessionStorage?.setItem(storageKey, '1');
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const markComplete = useCallback(() => {
    phaseCompleteRef.current = true;
    persistDone();
    setVisible(false);
  }, [persistDone]);

  useEffect(() => {
    if (skipFromSession || phaseCompleteRef.current) return;

    if (isLoading) {
      if (windowStartRef.current === null) {
        windowStartRef.current = Date.now();
      }
      setVisible(true);
      return;
    }

    const start = windowStartRef.current;
    /** 로딩 구간이 한 번도 없었으면 완료 처리·세션 저장하지 않음 (Clerk/역할 지연 시 조기 markComplete 방지) */
    if (start === null) {
      setVisible(false);
      return;
    }

    const elapsed = Date.now() - start;
    const remaining = minMs - elapsed;
    if (remaining <= 0) {
      markComplete();
      return;
    }

    setVisible(true);
    const id = window.setTimeout(() => {
      markComplete();
    }, remaining);
    return () => clearTimeout(id);
  }, [isLoading, minMs, skipFromSession, markComplete]);

  return visible;
}
