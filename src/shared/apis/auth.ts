const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

type AuthMeResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    memberId: number;    
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

  if (!res.ok) throw new Error(`auth/me failed: ${res.status}`);
  const data = (await res.json()) as AuthMeResponse;
  return data.result;
}
