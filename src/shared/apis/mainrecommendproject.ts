import { buildQuery } from '@libs/queryString';
import type { DurationRange, Position, ProjectField } from '@t/project/api.types';

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
  durationRangeName?: string;
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
  techstackScorePercent?: number | null;
  similarityScorePercent?: number | null;
  domainMatch?: boolean | null;
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

  const data = await res.json().catch(() => null);

  // 다양한 응답 구조 대응
  const result = data?.result;
  let projects: RecommendProjectPreviewItem[] = [];

  if (Array.isArray(result)) {
    // { result: [ ... ] }
    projects = result;
  } else if (Array.isArray(result?.projects)) {
    // { result: { projects: [ ... ], count: N } }
    projects = result.projects;
  } else if (result?.projects?.content && Array.isArray(result.projects.content)) {
    // { result: { projects: { content: [ ... ] } } }
    projects = result.projects.content;
  } else if (result?.content && Array.isArray(result.content)) {
    // { result: { content: [ ... ] } }
    projects = result.content;
  } else if (data?.projects?.content && Array.isArray(data.projects.content)) {
    // { projects: { content: [ ... ] } }
    projects = data.projects.content;
  }

  return projects;
}
