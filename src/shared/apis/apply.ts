const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

type ApplyStatusResponse = {
  isSuccess?: boolean;
  result?: {
    exists?: boolean;
    matchingId?: number;
    projectId?: number;
    status?: string;
    part?: string;
  };
};

type ProposalResponse = {
  isSuccess?: boolean;
  result?: {
    matchingId?: number;
    projectId?: number;
    projectName?: string;
    memberNickname?: string;
    status?: string;
    matchingType?: string;
    createdAt?: string;
  };
  message?: string;
};

export async function getMyApplyStatus(projectId: number, token: string) {
  const res = await fetch(`${BASE_URL}/api/v1/matching/projects/${projectId}/my-apply`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message ?? `apply status failed: ${res.status}`);
  }

  const data = (await res.json().catch(() => null)) as ApplyStatusResponse | null;
  return {
    exists: data?.result?.exists ?? false,
    matchingId: data?.result?.matchingId,
    status: data?.result?.status,
    part: data?.result?.part,
  };
}

/** PATCH /api/v1/matching/applications/projects/{projectId} - 지원 파트 수정 (PENDING 상태에서만 변경 가능) */
export async function updateMyApply(projectId: number, part: string, token: string) {
  const res = await fetch(`${BASE_URL}/api/v1/matching/applications/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ part }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message ?? `update apply failed: ${res.status}`);
  }

  return res.json().catch(() => null);
}

export async function applyProject(projectId: number, part: string, token: string) {
  const res = await fetch(`${BASE_URL}/api/v1/matching/applications/projects/${projectId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ part }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message ?? `apply project failed: ${res.status}`);
  }

  return res.json().catch(() => null);
}

export async function createMemberProposal(
  nickname: string,
  projectId: number,
  part: string | null,
  content: string,
  token: string
) {
  const res = await fetch(`${BASE_URL}/api/v1/matching/proposals/members/${nickname}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ projectId,part,content }),
  });

  const json = (await res.json().catch(() => null)) as ProposalResponse | null;
  if (!res.ok) {
    const message = json?.message ?? `proposal failed: ${res.status}`;
    throw new Error(message);
  }

  return json?.result;
}
