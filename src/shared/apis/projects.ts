const BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

export async function getProjects(params: string, token: string, signal?: AbortSignal) {
  const qs = params ? `?${params}` : '';

  console.log('REQUEST =>', `${BASE_URL}/api/v1/projects${qs}`);

  const res = await fetch(`${BASE_URL}/api/v1/projects${qs}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  const json = await res.json().catch(() => null);
  console.log(json);

  return json.result.projects;
}

export type CreateProjectBody = {
  projectField: string;
  category: string;
  mode: string;
  durationMonths: number;
  location: string;
  recruitmentDeadline: string;
  recruitments: Array<{ position: string; count: number; techStacks: string[] }>;
  title: string;
  content: string;
  imageIds: number[];
};

export type CreateProjectResult = {
  projectId: number;
};

export async function createProject(
  body: CreateProjectBody,
  token: string,
): Promise<CreateProjectResult> {
  const res = await fetch(`${BASE_URL}/api/v1/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);
  if (import.meta.env.DEV) {
    console.log('[createProject] response status', res.status, 'body', json);
  }
  if (!res.ok) {
    const message = json?.message ?? json?.error ?? `요청 실패 (${res.status})`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return { projectId: json.result?.projectId ?? json.projectId };
}
