import { useCallback, useEffect, useRef, useState } from 'react';

export const INITIAL_SKELETON_MIN_MS = 2000;

const STORAGE_PREFIX = 'devine_initial_skeleton:';

export type InitialSkeletonGateOptions = {
  minMs?: number;
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

export function isInitialSkeletonSessionDone(sessionKey: string): boolean {
  return readSessionDone(`${STORAGE_PREFIX}${sessionKey}`);
}

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
    } catch {}
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
