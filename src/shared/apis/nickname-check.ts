const BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

type NicknameCheckResponse = {
  isSuccess: boolean;
  result?: {
    nickname: string;
    isDuplicate: boolean;
  };
};

export async function checkNicknameDuplicate(nickname: string, token?: string) {
  const qs = new URLSearchParams({ nickname }).toString();
  const res = await fetch(`${BASE_URL}/api/v1/members/nickname/check?${qs}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`nickname check failed: ${res.status}`);
  }

  const data = (await res.json()) as NicknameCheckResponse;
  return data.result?.isDuplicate ?? false;
}
