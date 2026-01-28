import { useCallback, useMemo } from 'react';

export type AuthUser = {
  nickname: string;
};

export type AuthState = {
  isAuthed: boolean;
  user: AuthUser | null;
  /**
   * 개발용 로그인 토글.
   * 실제 인증 연동이 붙으면 이 함수는 제거/대체될 수 있음.
   */
  setDevAuthed: (next: boolean) => void;
};

export function useAuth(): AuthState {
  // TODO: 로그인 연동 전까지 임시로 "항상 로그인" 처리
  // Fast Refresh/훅 순서 깨짐을 피하려고 "훅 형태"는 유지합니다.
  const user = useMemo<AuthUser>(() => ({ nickname: 'DevUser' }), []);
  const setDevAuthed = useCallback((_next: boolean) => {
    // hardcoded mode: no-op
  }, []);

  return {
    isAuthed: true,
    user,
    setDevAuthed,
  };
}

