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
    size: params.size,
  });

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

type RecommendProjectPosition = {
  position: Position;
  positionName: string;
  count: number;
  currentCount: number;
  techStacks: Array<{ techStack: string }>;
};

export type RecommendProjectPreviewItem = {
  projectId: number;
  title: string;
  projectField: ProjectField;
  projectFieldName: string;
  categoryName: string;
  mode: string;
  modeName: string;
  durationMonths: number;
  location: string;
  recruitmentDeadline: string;
  daysUntilDeadline: number;
  status: string;
  thumbnailUrl?: string | null;
  positions: RecommendProjectPosition[];
  creatorName: string;
  techScore?: number;
  domainScore?: number;
  techStackCountScore?: number;
  totalScore?: number;
  bookmarked?: boolean;
  bookmarkId?: number;
};

type RecommendProjectsResponse = {
  result?: {
    projects?: {
      content?: RecommendProjectPreviewItem[];
    };
  };
  projects?: {
    content?: RecommendProjectPreviewItem[];
  };
};

export async function getRecommendProjectsPreview(limit: number, token: string) {
  const res = await fetch(`${BASE_URL}/api/v1/projects/recommend/preview?limit=${limit}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`recommend projects failed: ${res.status}`);
  }

  const data = (await res.json().catch(() => null)) as RecommendProjectsResponse | null;
  const projects = data?.result?.projects?.content ?? data?.projects?.content ?? [];
  return projects;
}
