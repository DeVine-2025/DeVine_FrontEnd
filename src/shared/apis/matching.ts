const BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

export type MatchingStatus = 'PENDING' | 'ACCEPT' | 'REJECT';
export type RespondDecision = 'ACCEPT' | 'REJECT';

export type RespondApplicationResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    matchingId: number;
    projectId: number;
    projectName: string;
    memberNickname: string;
    status: MatchingStatus;
    matchingType: 'APPLY' | 'SUGGEST' | string;
    createdAt: string;
  };
};

export async function respondApplication(
  matchingId: number,
  decision: RespondDecision,
  token: string,
  signal?: AbortSignal,
): Promise<RespondApplicationResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/matching/applications/${matchingId}/respond`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ decision }),
    signal,
  });

  const data = (await res.json().catch(() => null)) as RespondApplicationResponse | null;

  if (!res.ok) {
    throw new Error(data?.message || `respondApplication failed: ${res.status}`);
  }

  return data!;
}

export async function respondProposal(
  matchingId: number,
  decision: RespondDecision,
  token: string,
) {
  const res = await fetch(`${BASE_URL}/api/v1/matching/proposals/${matchingId}/respond`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ decision }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Failed to respond proposal (${res.status})`);
  }

  return res.json();
}
