import { getAuthMe } from './auth';

export type SignupPayload = {
  agreements: { termsId: number; agreed: boolean }[];
  nickname: string;
  imageUrl?: string | null;
  mainType: 'PM' | 'DEVELOPER';
  categoryIds: number[];
  techstackIds: number[];
  body?: string | null;
  email?: string | null;
  linkedin?: string | null;
};

const BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

export async function signupMember(payload: SignupPayload, token?: string) {
  const res = await fetch(`${BASE_URL}/api/v1/members/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);

  // 중복 가입 응답도 현재 서버에 회원이 실제 존재하는 경우에만 성공 처리합니다.
  if (res.status === 409 && json?.code === 'MEMBER409_2' && token) {
    const member = await getAuthMe(token);
    if (member.isRegistered) return json;
    throw new Error('회원가입 상태를 확인하지 못했습니다. 다시 시도해 주세요.');
  }

  if (!res.ok || json?.isSuccess !== true) {
    const message = json?.message ?? `signup failed: ${res.status}`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return json;
}
