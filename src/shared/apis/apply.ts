const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

type ApplyStatusResponse = {
  isSuccess?: boolean;
  result?: {
    exists?: boolean;
    matchingId?: number;
    projectId?: number;
    status?: string;
  };
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
    status: data?.result?.status,
  };
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
