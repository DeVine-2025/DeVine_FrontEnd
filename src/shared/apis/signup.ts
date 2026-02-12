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

  // 409 Conflict = 이미 가입된 회원 → 성공으로 간주 (idempotent)
  if (res.status === 409) {
    console.warn('[signup] 이미 가입된 회원입니다. 정상 처리합니다.');
    return json;
  }

  if (!res.ok) {
    const message = json?.message ?? `signup failed: ${res.status}`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return json;
}