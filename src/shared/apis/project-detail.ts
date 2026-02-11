import type { ProjectItem } from '@t/project/api';

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
