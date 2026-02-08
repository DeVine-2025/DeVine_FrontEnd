const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function applyProject(projectId: number, token: string) {
  const res = await fetch(`${BASE_URL}/api/v1/matching/projects/${projectId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message ?? `apply project failed: ${res.status}`);
  }

  return res.json().catch(() => null);
}
