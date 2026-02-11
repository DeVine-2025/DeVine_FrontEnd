import { buildQuery } from '@libs/queryString';

type RecommendDeveloperPreviewItem = {
  memberId?: number;
  nickname: string;
  image: string | null;
  body: string;
  techstacks: string[];
  domains?: string[];
  mainType?: string;
  bookmarked?: boolean;
  bookmarkId?: number;
};

type RecommendDeveloperPreviewRaw = {
  memberId?: number;
  nickname?: string;
  image?: string | null;
  body?: string;
  techstacks?: Array<string | { name?: string; techstack?: string; techStackName?: string }>;
  domains?: string[];
  mainType?: string;
  bookmarked?: boolean;
  bookmarkId?: number;
  member?: {
    id?: number;
    memberId?: number;
    nickname?: string;
    imageUrl?: string | null;
    body?: string | null;
    mainType?: string;
  };
};

type RecommendDeveloperPreviewResponse = {
  isSuccess: boolean;
  result?: RecommendDeveloperPreviewItem[];
};

const BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

type MemberProfileResponse = {
  result?: {
    nickname?: string;
    image?: string | null;
    body?: string | null;
    techstacks?: string[];
    techGenres?: string[];
  };
};

export async function getMemberProfileByNickname(nickname: string, signal?: AbortSignal) {
  const safeNickname = encodeURIComponent(nickname);
  const res = await fetch(`${BASE_URL}/api/v1/members/${safeNickname}`, {
    method: 'GET',
    signal,
  });

  const data = (await res.json().catch(() => null)) as MemberProfileResponse | null;
  if (!res.ok) {
    throw new Error(`member profile failed: ${res.status}`);
  }

  return data?.result ?? null;
}

export async function getRecommendDevelopersPreview(
  limit: number,
  token: string,
  projectId?: number,
) {
  const qs = buildQuery({ limit, projectId });
  const res = await fetch(`${BASE_URL}/api/v1/members/recommend/preview${qs}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`recommend developers failed: ${res.status}`);
  }

  const data = (await res.json()) as RecommendDeveloperPreviewResponse | null;
  const list = (data?.result ?? []) as RecommendDeveloperPreviewRaw[];
  return list.map((item) => {
    const member = item.member;
    const techstacks = (item.techstacks ?? [])
      .map((v) => {
        if (typeof v === 'string') return v;
        return v?.name ?? v?.techstack ?? v?.techStackName ?? '';
      })
      .filter((v) => v.trim().length > 0);
    return {
      memberId: item.memberId ?? member?.memberId ?? member?.id,
      nickname: item.nickname ?? member?.nickname ?? '',
      image: item.image ?? member?.imageUrl ?? null,
      body: item.body ?? member?.body ?? '',
      techstacks,
      domains: item.domains ?? [],
      mainType: item.mainType ?? member?.mainType,
      bookmarked: item.bookmarked,
      bookmarkId: item.bookmarkId,
    } as RecommendDeveloperPreviewItem;
  });
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
  // 백엔드 구현에 따라 result가 배열이거나, 내부 키가 다를 수 있어 유연하게 처리
  result?: unknown;
  data?: unknown;
  projects?: unknown;
};

export async function getMyProjects(token: string, signal?: AbortSignal): Promise<MyProjectDto[]> {
  const res = await fetch(`/api/v1/members/me/projects`, {
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

  const pick = (v: unknown): MyProjectDto[] | null => {
    if (!v) return null;
    if (Array.isArray(v)) return v as MyProjectDto[];
    if (typeof v === 'object') {
      const obj = v as Record<string, unknown>;
      const candidates = [
        obj.projects,
        obj.projectList,
        obj.myProjects,
        obj.list,
        obj.items,
      ];
      for (const c of candidates) {
        if (Array.isArray(c)) return c as MyProjectDto[];
      }
    }
    return null;
  };

  // 흔한 응답 형태들을 순서대로 시도
  const roots: unknown[] = [
    json?.result,
    json?.data,
    json?.projects,
    // result 안에 한 번 더 감싸진 형태도 방어
    (json?.result as any)?.result,
    (json?.result as any)?.data,
  ];

  for (const r of roots) {
    const hit = pick(r);
    if (hit) return hit;
  }

  return [];
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
  id?: number;
  memberId?: number;
  nickname: string;
  image: string;
  body: string;
  techstacks: string[];
  bookmarked?: boolean;
  bookmarkId?: number;
  [key: string]: unknown;
};

function extractMemberId(dto: Record<string, unknown>): number | undefined {
  const keys = [
    'memberId',
    'id',
    'member_id',
    'userId',
    'user_id',
    'memberNo',
    'userNo',
    'developerId',
    'accountId',
  ];
  for (const key of keys) {
    const v = dto[key];
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) return v;
    if (typeof v === 'string' && /^\d+$/.test(v)) return parseInt(v, 10);
  }
  for (const nest of ['member', 'user', 'profile', 'developer', 'account']) {
    const obj = dto[nest] as Record<string, unknown> | undefined;
    if (obj && typeof obj === 'object') {
      const fromNest = extractMemberId(obj);
      if (fromNest != null) return fromNest;
    }
  }
  return undefined;
}

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
  const memberId =
    (typeof dto.memberId === 'number' && dto.memberId > 0 ? dto.memberId : undefined) ??
    (typeof dto.id === 'number' && dto.id > 0 ? dto.id : undefined) ??
    extractMemberId(dto as Record<string, unknown>);
  if (memberId == null && import.meta.env?.DEV) {
    console.warn('[추천 개발자] memberId 없음 – 북마크 불가', Object.keys(dto), dto);
  }
  return {
    id: `member-${memberId ?? index}-${dto.nickname ?? ''}`,
    memberId: memberId ?? undefined,
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
