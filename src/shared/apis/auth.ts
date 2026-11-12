import { BASE_URL } from '@constants/endpoints';

export const authMeQueryKey = (userId: string | null | undefined) =>
  ['authMe', import.meta.env.VITE_API_BASE_URL, userId] as const;

export class AuthMeError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'AuthMeError';
    this.status = status;
    this.code = code;
  }
}

type AuthMeResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    memberId: number | null;
    clerkId: string;
    email: string | null;
    isRegistered: boolean;
  };
};

export async function getAuthMe(token: string) {
  const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = (await res.json().catch(() => null)) as AuthMeResponse | null;
  if (!res.ok || data?.isSuccess !== true) {
    throw new AuthMeError(data?.message ?? '회원 정보를 확인하지 못했습니다.', res.status, data?.code);
  }
  if (typeof data.result?.isRegistered !== 'boolean') {
    throw new AuthMeError('회원 정보 응답을 확인하지 못했습니다.', res.status);
  }
  return data.result;
}
