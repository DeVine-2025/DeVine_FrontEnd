import { buildQuery } from '@libs/queryString';
import type { GetProjectsParams } from '@t/project/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function getProjects(params: GetProjectsParams, token: string, signal?: AbortSignal) {
  const qs = buildQuery({
    projectField: params.projectField,
    category: params.category,
    position: params.position,
    techstackName: params.techstackName,
    durationRange: params.durationRange,
    page: params.page ?? 1,
    size: params.size ?? 10,
  });
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
