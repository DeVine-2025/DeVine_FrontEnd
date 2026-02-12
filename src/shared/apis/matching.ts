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
  const res = await fetch(`/api/v1/matching/applications/${matchingId}/respond`, {
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
