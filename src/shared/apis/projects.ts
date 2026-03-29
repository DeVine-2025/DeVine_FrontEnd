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

// 개발 시에는 상대 경로(/api) 사용 → Vite 프록시가 백엔드로 전달. 프로덕션에서는 VITE_API_BASE_URL 사용.
const BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

export async function getProjects(
  params: GetProjectsParams | string,
  token?: string,
  signal?: AbortSignal,
) {
  const qs =
    typeof params === 'string'
      ? params
      : buildQuery({
          projectFields: params.projectFields,
          categoryIds: params.categoryIds,
          positions: params.positions,
          techStackIds: params.techStackIds,
          durationRange: params.durationRange,
          page: params.page ?? 1,
          size: params.size ?? 10,
        });
  const queryString = qs.startsWith('?') ? qs : `?${qs}`;

  const res = await fetch(`${BASE_URL}/api/v1/projects${queryString}`, {
    method: 'GET',
    headers: {
      accept: '*/*',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal,
  });

  const json = await res.json().catch(() => null);
  const projects = json?.result?.projects;

  if (!res.ok) {
    throw new Error('프로젝트 목록을 불러오지 못했어요.');
  }

  if (!projects) {
    return { content: [], totalPages: 0 };
  }

  return projects;
}

export type CreateProjectBody = {
  projectField: string;
  category: string;
  mode: string;
  durationMonths: number;
  durationRange: string;
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

/** PATCH /api/v1/projects/{projectId} - 프로젝트 수정 */
export async function updateProject(
  projectId: number,
  body: CreateProjectBody,
  token: string,
): Promise<CreateProjectResult> {
  const res = await fetch(`${BASE_URL}/api/v1/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);
  if (import.meta.env.DEV) {
    console.log('[updateProject] response status', res.status, 'body', json);
  }
  if (!res.ok) {
    const message = json?.message ?? json?.error ?? `요청 실패 (${res.status})`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return { projectId: json.result?.projectId ?? json.projectId ?? projectId };
}

export type MyRecruitingProjectItem = {
  projectId: number;
  title: string;
  thumbnailUrl?: string;
  categoryName?: string;
  location?: string;
  durationRangeName?: string;
  modeName?: string;
};

type MyRecruitingContentItem = {
  projectId?: number;
  id?: number;
  title?: string;
  thumbnailUrl?: string;
  categoryName?: string;
  location?: string;
  durationRangeName?: string;
  modeName?: string;
  [key: string]: unknown;
};

type MyRecruitingResponse = {
  result?: {
    projects?: {
      content?: MyRecruitingContentItem[];
    };
  };
  projects?: {
    content?: MyRecruitingContentItem[];
  };
};

function extractMyProjectsRawList(json: MyRecruitingResponse | null): MyRecruitingContentItem[] {
  const result = (json as any)?.result;
  let rawList: MyRecruitingContentItem[] = [];
  if (Array.isArray(result)) {
    rawList = result;
  } else if (Array.isArray(result?.projects)) {
    rawList = result.projects;
  } else if (Array.isArray(result?.projects?.content)) {
    rawList = result.projects.content;
  } else if (result && 'content' in result && Array.isArray((result as any).content)) {
    rawList = (result as any).content as MyRecruitingContentItem[];
  } else {
    const proj = (json as any)?.projects;
    if (Array.isArray(proj)) {
      rawList = proj as MyRecruitingContentItem[];
    } else if (
      proj &&
      typeof proj === 'object' &&
      'content' in proj &&
      Array.isArray((proj as any).content)
    ) {
      rawList = (proj as any).content as MyRecruitingContentItem[];
    }
  }
  return rawList;
}

async function fetchMyProjectsByPath(
  path: string,
  token: string,
  signal?: AbortSignal,
): Promise<MyRecruitingProjectItem[]> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  const json = (await res.json().catch(() => null)) as MyRecruitingResponse | null;
  if (!res.ok) {
    const message =
      json && 'message' in (json as Record<string, unknown>) ? (json as any).message : null;
    throw new Error(typeof message === 'string' ? message : `요청 실패 (${res.status})`);
  }

  const content = json?.result?.projects?.content ?? json?.projects?.content ?? [];

  return content
    .map((item) => ({
      projectId: item.projectId ?? 0,
      title: typeof item.title === 'string' ? item.title : '',
      thumbnailUrl: item.thumbnailUrl ?? '',
      categoryName: item.categoryName,
      location: item.location,
      durationRangeName: item.durationRangeName,
      modeName: item.modeName,
    }))
    .filter((item) => Number.isFinite(item.projectId) && item.projectId > 0);
}

export async function getMyRecruitingProjects(
  token: string,
  signal?: AbortSignal,
): Promise<MyRecruitingProjectItem[]> {
  return fetchMyProjectsByPath('/api/v1/projects/my/recruiting', token, signal);
}

/**
 * 내 프로젝트 목록(상태 무관) - 추천 개발자에서 "프로젝트 등록 여부" 판별용
 * 백엔드에서 방금 만든 프로젝트가 RECRUITING으로 즉시 반영되지 않아도 잡히도록
 * recruiting / in-progress / completed를 합쳐서 반환합니다.
 */
export async function getMyProjectsAllStatuses(
  token: string,
  signal?: AbortSignal,
): Promise<MyRecruitingProjectItem[]> {
  const endpoints = [
    '/api/v1/projects/my/recruiting',
    '/api/v1/projects/my/in-progress',
    '/api/v1/projects/my/completed',
  ] as const;

  const settled = await Promise.allSettled(
    endpoints.map((p) => fetchMyProjectsByPath(p, token, signal)),
  );

  const merged: MyRecruitingProjectItem[] = [];
  for (const s of settled) {
    if (s.status === 'fulfilled') merged.push(...s.value);
  }

  // projectId 기준 중복 제거
  return Array.from(new Map(merged.map((p) => [p.projectId, p])).values());
}
