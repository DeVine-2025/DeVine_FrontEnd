import { useAuth } from '@clerk/clerk-react';
import { buildQuery } from '@libs/queryString';
import type { DurationRange, GetProjectsResponse, Position, ProjectField } from '../types/projects';

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

export async function getProjects(params: GetProjectsParams, signal?: AbortSignal) {
  const qs = buildQuery({
    projectFields: params.projectFields,
    categoryIds: params.categoryIds,
    positions: params.positions,
    techStackIds: params.techStackIds,
    durationRange: params.durationRange,
    page: params.page ?? 1,
    size: params.size,
  });

  const { getToken } = useAuth();
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/api/v1/projects${qs}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      // 'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GET /api/v1/projects failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as GetProjectsResponse;
  return data.projects;
}
