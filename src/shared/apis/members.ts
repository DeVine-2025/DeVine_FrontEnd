import { buildQuery } from '@libs/queryString';

type RecommendDeveloperPreviewItem = {
  nickname: string;
  image: string | null;
  body: string;
  techstacks: string[];
};

type RecommendDeveloperPreviewResponse = {
  isSuccess: boolean;
  result?: RecommendDeveloperPreviewItem[];
};

const BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

export async function getRecommendDevelopersPreview(limit: number, token: string) {
  const res = await fetch(`${BASE_URL}/api/v1/members/recommend/preview?limit=${limit}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`recommend developers failed: ${res.status}`);
  }

  const data = (await res.json()) as RecommendDeveloperPreviewResponse;
  return data.result ?? [];
}

/** GET /api/v1/members/me/projects - 내가 만든(게시한) 프로젝트 목록 */
export type MyProjectDto = {
  id: number;
  name: string;
  content: string;
  status: string;
  imageUrls: string[];
};

type MyProjectsResponse = {
  isSuccess?: boolean;
  message?: string;
  result?: { projects?: MyProjectDto[] };
};

export async function getMyProjects(token: string, signal?: AbortSignal): Promise<MyProjectDto[]> {
  const res = await fetch(`${BASE_URL}/api/v1/members/me/projects`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  const json = (await res.json().catch(() => null)) as MyProjectsResponse | null;
  if (!res.ok) {
    const message =
      json && typeof json.message === 'string' ? json.message : `요청 실패 (${res.status})`;
    throw new Error(message);
  }

  return json?.result?.projects ?? [];
}

export type GetRecommendMembersParams = {
  /** 서버 필수: 해당 프로젝트에 맞는 개발자 추천 */
  projectId: number;
  projectIds?: number[];
  category?: string;
  techGenre?: string;
  techstackName?: string;
  page?: number;
  size?: number;
};

type RecommendMemberDto = {
  memberId?: number;
  nickname: string;
  image: string;
  body: string;
  techstacks: string[];
  bookmarked?: boolean;
  bookmarkId?: number;
};

type RecommendMembersPage = {
  content: RecommendMemberDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

type RecommendMembersResponse = {
  result?: RecommendMembersPage;
};

export type RecommendDeveloperListItem = {
  id: string;
  memberId?: number;
  nickname: string;
  profileImageUrl?: string;
  introduction?: string;
  techStack: Array<{ id: string; name: string }>;
  role: string;
  roleTone: 'blue' | 'green' | 'pink' | 'orange';
  domains?: Array<{ label: string }>;
  bookmarked?: boolean;
  bookmarkId?: number;
};

function mapRecommendMemberToListItem(dto: RecommendMemberDto, index: number): RecommendDeveloperListItem {
  return {
    id: `member-${dto.memberId ?? index}-${dto.nickname ?? ''}`,
    memberId: dto.memberId,
    nickname: dto.nickname ?? '',
    profileImageUrl: dto.image || undefined,
    introduction: dto.body ?? '',
    techStack: (dto.techstacks ?? []).map((name, i) => ({ id: `t-${index}-${i}`, name })),
    role: '개발자',
    roleTone: 'blue',
    domains: [],
    bookmarked: dto.bookmarked,
    bookmarkId: dto.bookmarkId,
  };
}

export type RecommendMembersResult = {
  list: RecommendDeveloperListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export async function getRecommendMembers(
  token: string,
  params?: GetRecommendMembersParams,
  signal?: AbortSignal,
): Promise<RecommendMembersResult> {
  const qs = buildQuery({
    projectId: params?.projectId,
    projectIds: params?.projectIds,
    category: params?.category,
    techGenre: params?.techGenre,
    techstackName: params?.techstackName,
    page: params?.page ?? 1,
    size: params?.size ?? 10,
  });

  const res = await fetch(`${BASE_URL}/api/v1/members/recommend${qs}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  const json = (await res.json().catch(() => null)) as RecommendMembersResponse | null;
  if (!res.ok) {
    const url = `${BASE_URL}/api/v1/members/recommend${qs}`;
    console.error('[추천 개발자 API] 요청 실패', {
      url,
      status: res.status,
      params: { projectId: params?.projectId, projectIds: params?.projectIds, category: params?.category, techGenre: params?.techGenre, techstackName: params?.techstackName, page: params?.page, size: params?.size },
      responseBody: json,
    });
    const message =
      json && typeof (json as { message?: string }).message === 'string'
        ? (json as { message: string }).message
        : `요청 실패 (${res.status})`;
    throw new Error(message);
  }

  const page = json?.result;
  const content = page?.content ?? [];
  const list = content.map(mapRecommendMemberToListItem);

  return {
    list,
    page: page?.page ?? 1,
    size: page?.size ?? 10,
    totalElements: page?.totalElements ?? 0,
    totalPages: page?.totalPages ?? 0,
    first: page?.first ?? true,
    last: page?.last ?? true,
  };
}
