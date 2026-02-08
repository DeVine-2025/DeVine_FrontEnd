import { buildQuery } from '@libs/queryString';
import type { DurationRange, Position, ProjectField } from '@t/project/api';

export type GetProjectsParams = {
  projectFields?: ProjectField[];
  categoryIds?: number[];
  positions?: Position[];
  techStackIds?: number[];
  durationRange?: DurationRange;
  page?: number; // 1부터 시작
  size?: number;
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function getProjects(params: GetProjectsParams, token: string, signal?: AbortSignal) {
  const qs = buildQuery({
    projectFields: params.projectFields,
    categoryIds: params.categoryIds,
    positions: params.positions,
    techStackIds: params.techStackIds,
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
