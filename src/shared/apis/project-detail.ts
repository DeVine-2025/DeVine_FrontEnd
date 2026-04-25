import type { ProjectItem } from '@t/project/api.types';

export type WeeklyBestProjectPosition = {
  position: string;
  positionName: string;
  count: number;
  currentCount: number;
  techStacks: string[];
};

export type WeeklyBestProject = {
  projectId: number;
  title: string;
  projectFieldName: string;
  categoryName: string;
  modeName: string;
  durationMonths: number;
  durationRangeName?: string;
  location: string;
  daysUntilDeadline: number;
  thumbnailUrl?: string | null;
  positions: WeeklyBestProjectPosition[];
};

type WeeklyBestResponse = {
  isSuccess: boolean;
  result?: {
    projects?: WeeklyBestProject[];
  };
};

type ProjectDetailResponse = {
  isSuccess: boolean;
  result?: ProjectItem;
};

const BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

export async function getWeeklyBestProjects() {
  const res = await fetch(`${BASE_URL}/api/v1/projects/weekly-best`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`weekly best failed: ${res.status}`);
  }

  const data = (await res.json()) as WeeklyBestResponse;
  return data.result?.projects ?? [];
}

export type ProjectStatus = 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED';

export async function updateProjectStatus(projectId: number, status: ProjectStatus, token: string) {
  const res = await fetch(`${BASE_URL}/api/v1/projects/${projectId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message ?? `update project status failed: ${res.status}`);
  }

  return res.json().catch(() => null);
}

export async function getProjectDetail(projectId: number, token?: string | null) {
  const res = await fetch(`${BASE_URL}/api/v1/projects/${projectId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`project detail failed: ${res.status}`);
  }

  const data = (await res.json().catch(() => null)) as ProjectDetailResponse | null;
  if (!data) return null;

  return data.result ?? null;
}

export async function cancelMyApply(projectId: number, token: string) {
  const res = await fetch(
    `${BASE_URL}/api/v1/matching/applications/projects/${projectId}/cancel`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message ?? '지원 취소에 실패했습니다.');
  }

  return res.json().catch(() => null);
}
