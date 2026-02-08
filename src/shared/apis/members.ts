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

export type GetRecommendMembersParams = {
  projectIds?: number[];
  category?: string;
  techGenre?: string;
  techstackName?: string;
  page?: number;
  size?: number;
};

type RecommendMemberDto = {
  nickname: string;
  image: string;
  body: string;
  techstacks: string[];
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
  nickname: string;
  profileImageUrl?: string;
  introduction?: string;
  techStack: Array<{ id: string; name: string }>;
  role: string;
  roleTone: 'blue' | 'green' | 'pink' | 'orange';
  domains?: Array<{ label: string }>;
};

function mapRecommendMemberToListItem(dto: RecommendMemberDto, index: number): RecommendDeveloperListItem {
  return {
    id: `member-${index}-${dto.nickname ?? ''}`,
    nickname: dto.nickname ?? '',
    profileImageUrl: dto.image || undefined,
    introduction: dto.body ?? '',
    techStack: (dto.techstacks ?? []).map((name, i) => ({ id: `t-${index}-${i}`, name })),
    role: '개발자',
    roleTone: 'blue',
    domains: [],
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
