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
    techstacks?: string[] | Array<{ name?: string; techstack?: string; techStackName?: string }>;
    techStacks?: unknown[];
    techGenres?: string[];
    member?: {
      nickname?: string;
      imageUrl?: string | null;
      body?: string | null;
      techstacks?: unknown[];
      techStacks?: unknown[];
      domains?: unknown[];
    };
    domains?: string[] | Array<{ label?: string; name?: string }>;
    interestDomains?: unknown[];
    contacts?: Array<{ type?: string; value?: string; link?: string }>;
  };
};

function normalizeTechstacksToNames(raw: unknown): string[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item != null && typeof item === 'object') {
        const o = item as Record<string, unknown>;
        const n =
          o.name ?? o.techstack ?? o.techStackName ?? o.techstackName ?? o.skillName ?? o.label;
        return typeof n === 'string' ? n.trim() : '';
      }
      return String(item ?? '').trim();
    })
    .filter((s) => s.length > 0);
}

function normalizeDomainsToLabels(raw: unknown): string[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item != null && typeof item === 'object') {
        const o = item as Record<string, unknown>;
        const label = o.label ?? o.name ?? o.domain;
        return typeof label === 'string' ? label.trim() : '';
      }
      return String(item ?? '').trim();
    })
    .filter((s) => s.length > 0);
}

export async function getMemberProfileByNickname(
  nickname: string,
  signal?: AbortSignal,
  token?: string | null,
) {
  const safeNickname = encodeURIComponent(nickname);
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}/api/v1/members/${safeNickname}`, {
    method: 'GET',
    headers: Object.keys(headers).length > 0 ? headers : undefined,
    signal,
  });

  const data = (await res.json().catch(() => null)) as MemberProfileResponse | null;
  if (!res.ok) {
    throw new Error(`member profile failed: ${res.status}`);
  }

  if (!data?.result) return null;
  const result = data.result as Record<string, unknown>;
  const member = result.member as Record<string, unknown> | undefined;
  const techstacksRaw =
    result.techstacks ?? result.techStacks ?? member?.techstacks ?? member?.techStacks;
  const domainsRaw =
    result.domains ?? result.interestDomains ?? member?.domains;
  return {
    nickname: (result.nickname ?? member?.nickname) as string | undefined,
    image: (result.image ?? member?.imageUrl ?? null) as string | null,
    body: (result.body ?? member?.body ?? null) as string | null,
    techstacks: normalizeTechstacksToNames(techstacksRaw),
    domains: normalizeDomainsToLabels(domainsRaw),
    techGenres: (result.techGenres ?? []) as string[],
  };
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
        return (
          (v as { name?: string; techstack?: string; techStackName?: string })?.name ??
          (v as { techstack?: string })?.techstack ??
          (v as { techStackName?: string })?.techStackName ??
          ''
        );
      })
      .filter((v) => String(v).trim().length > 0);
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
      const candidates = [obj.projects, obj.projectList, obj.myProjects, obj.list, obj.items];
      for (const c of candidates) {
        if (Array.isArray(c)) return c as MyProjectDto[];
      }
    }
    return null;
  };

  const roots: unknown[] = [
    json?.result,
    json?.data,
    json?.projects,
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
    'no',
    'num',
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

function pickString(dto: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = dto[key];
    if (typeof v === 'string' && v.trim().length > 0) return v.trim();
  }
  for (const nest of ['member', 'user', 'profile', 'developer', 'account']) {
    const obj = dto[nest] as Record<string, unknown> | undefined;
    if (obj && typeof obj === 'object') {
      for (const key of keys) {
        const v = obj[key];
        if (typeof v === 'string' && v.trim().length > 0) return v.trim();
      }
    }
  }
  return '';
}

function pickImageUrl(dto: Record<string, unknown>): string | undefined {
  const v =
    dto.image ??
    dto.imageUrl ??
    dto.profileImageUrl ??
    dto.profileImage ??
    dto.profileImgUrl ??
    dto.avatarUrl ??
    dto.avatar ??
    dto.avatarImage;
  if (typeof v === 'string' && v.trim().length > 0) return v.trim();
  for (const nest of ['member', 'user', 'profile', 'developer', 'account']) {
    const obj = dto[nest] as Record<string, unknown> | undefined;
    if (obj && typeof obj === 'object') {
      const w =
        obj.image ??
        obj.imageUrl ??
        obj.profileImageUrl ??
        obj.profileImage ??
        obj.profileImgUrl ??
        obj.avatarUrl ??
        obj.avatar ??
        obj.avatarImage;
      if (typeof w === 'string' && w.trim().length > 0) return w.trim();
    }
  }
  return undefined;
}

function pickMainType(dto: Record<string, unknown>): string | undefined {
  const v = dto.mainType ?? dto.memberType ?? dto.role ?? dto.memberRole;
  if (typeof v === 'string' && v.trim().length > 0) return v.trim();
  for (const nest of ['member', 'user', 'profile', 'developer', 'account']) {
    const obj = dto[nest] as Record<string, unknown> | undefined;
    if (obj && typeof obj === 'object') {
      const w = obj.mainType ?? obj.memberType ?? obj.role ?? obj.memberRole;
      if (typeof w === 'string' && w.trim().length > 0) return w.trim();
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

function mapRecommendMemberToListItem(
  dto: RecommendMemberDto,
  index: number,
): RecommendDeveloperListItem {
  const raw = dto as Record<string, unknown>;
  const mainType = pickMainType(raw);
  const isPm = mainType === 'PM';
  const memberId =
    (typeof dto.memberId === 'number' && dto.memberId > 0 ? dto.memberId : undefined) ??
    (typeof dto.id === 'number' && dto.id > 0 ? dto.id : undefined) ??
    extractMemberId(raw);
  const nickname = pickString(
    raw,
    'nickname',
    'nickName',
    'memberNickname',
    'memberNick',
    'member_nickname',
    'nick',
    'name',
    'userName',
    'username',
    'displayName',
  );
  const introduction = pickString(raw, 'body', 'introduction', 'intro', 'bio', 'description');
  const profileImageUrl = pickImageUrl(raw);
  const techStack = (() => {
    const raw = dto as Record<string, unknown>;
    let arr: unknown[] = [];
    if (Array.isArray(raw.techstacks) && raw.techstacks.length > 0) arr = raw.techstacks;
    else if (Array.isArray(raw.techStacks) && raw.techStacks.length > 0) arr = raw.techStacks;
    else if (Array.isArray(raw.matchedTechstacks) && raw.matchedTechstacks.length > 0)
      arr = raw.matchedTechstacks;
    else if (Array.isArray(raw.techstackNames) && raw.techstackNames.length > 0)
      arr = raw.techstackNames;
    else if (Array.isArray(raw.techStackNames) && raw.techStackNames.length > 0)
      arr = raw.techStackNames;
    else if (Array.isArray(raw.skills) && raw.skills.length > 0) arr = raw.skills;
    else {
      for (const nest of ['member', 'user', 'profile', 'developer']) {
        const obj = raw[nest] as Record<string, unknown> | undefined;
        if (!obj || typeof obj !== 'object') continue;
        if (Array.isArray(obj.techstacks)) {
          arr = obj.techstacks;
          break;
        }
        if (Array.isArray(obj.techStacks)) {
          arr = obj.techStacks;
          break;
        }
        if (Array.isArray(obj.techstackNames)) {
          arr = obj.techstackNames;
          break;
        }
        if (Array.isArray(obj.skills)) {
          arr = obj.skills;
          break;
        }
      }
    }
    return arr
      .map((item, i) => {
        let name: string;
        if (typeof item === 'string') {
          name = item.trim();
        } else if (item != null && typeof item === 'object') {
          const o = item as Record<string, unknown>;
          const n =
            o.name ??
            o.techstack ??
            o.techstackName ??
            o.techStackName ??
            o.skillName ??
            o.label ??
            o.displayName;
          name = typeof n === 'string' ? n.trim() : String(item ?? '').trim();
        } else {
          name = String(item ?? '').trim();
        }
        return { id: `t-${index}-${i}`, name };
      })
      .filter((t) => t.name.length > 0);
  })();
  return {
    id: `member-${memberId ?? index}-${nickname || index}`,
    memberId: memberId ?? undefined,
    nickname: nickname || '(이름 없음)',
    profileImageUrl: profileImageUrl ?? undefined,
    introduction,
    techStack,
    role: isPm ? 'PM' : '개발자',
    roleTone: isPm ? 'blue' : 'green',
    domains: (() => {
      const raw = dto as Record<string, unknown>;
      let arr: unknown[] = [];
      if (Array.isArray(raw.domains)) arr = raw.domains;
      else if (Array.isArray(raw.interestDomains)) arr = raw.interestDomains;
      else if (Array.isArray(raw.domainList)) arr = raw.domainList;
      else {
        for (const nest of ['member', 'user', 'profile', 'developer']) {
          const obj = raw[nest] as Record<string, unknown> | undefined;
          if (!obj || typeof obj !== 'object') continue;
          if (Array.isArray(obj.domains)) {
            arr = obj.domains;
            break;
          }
          if (Array.isArray(obj.interestDomains)) {
            arr = obj.interestDomains;
            break;
          }
        }
      }
      return arr
        .map((item) => {
          const label =
            typeof item === 'string'
              ? item.trim()
              : item != null &&
                  typeof item === 'object' &&
                  'label' in item &&
                  typeof (item as { label: unknown }).label === 'string'
                ? (item as { label: string }).label.trim()
                : item != null &&
                    typeof item === 'object' &&
                    'name' in item &&
                    typeof (item as { name: unknown }).name === 'string'
                  ? (item as { name: string }).name.trim()
                  : '';
          return { label };
        })
        .filter((d) => d.label.length > 0);
    })(),
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
      params: {
        projectId: params?.projectId,
        projectIds: params?.projectIds,
        category: params?.category,
        techGenre: params?.techGenre,
        techstackName: params?.techstackName,
        page: params?.page,
        size: params?.size,
      },
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
  const list = content
    .filter((dto) => {
      const mainType = pickMainType(dto as Record<string, unknown>);
      return mainType !== 'PM';
    })
    .map(mapRecommendMemberToListItem);

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
