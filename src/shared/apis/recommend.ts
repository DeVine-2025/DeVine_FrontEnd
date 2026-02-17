import type { ProjectRole } from '@t/project/ui';
import { mapRecommendPositionsToRoles } from '@mappers/project';

const BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

/** GET /api/v1/projects/recommend 쿼리 파라미터 (API 스펙: 복수 선택 배열, 페이징 없음) */
export type GetRecommendProjectsParams = {
  projectFields?: string[]; // WEB, MOBILE, GAME, BLOCKCHAIN, ETC
  categories?: string[]; // HEALTHCARE, FINTECH, ECOMMERCE, EDUCATION, SOCIAL, ENTERTAINMENT, AI_DATA, ETC
  techstackNames?: string[]; // JAVA, JAVASCRIPT, REACT, SPRINGBOOT 등
  durationRanges?: string[]; // UNDER_ONE, ONE_TO_THREE, THREE_TO_SIX, SIX_PLUS
};

/** 응답 result.projects[] 한 건 (벡터 유사도 기반 복합 점수) */
export type RecommendProjectDto = {
  projectId: number;
  title: string;
  projectField?: string;
  projectFieldName?: string;
  category?: string;
  categoryName?: string;
  mode?: string;
  modeName?: string;
  durationRange?: string;
  durationRangeName?: string;
  location?: string;
  recruitmentDeadline?: string;
  daysUntilDeadline?: number;
  status?: string;
  thumbnailUrl?: string | null;
  positions?: Array<{
    position: string;
    positionName: string;
    count: number;
    currentCount: number;
    techStacks: Array<{ techStack: string }>;
  }>;
  creatorNickname?: string;
  /** 종합 점수 (복합 점수) */
  totalScore?: number | null;
  /** 리포트 유사도 (%) */
  similarityScorePercent?: number | null;
  /** 기술스택 매칭 (%) */
  techstackScorePercent?: number | null;
  /** 도메인 일치 여부 */
  domainMatch?: boolean | null;
  bookmarked?: boolean;
  bookmarkId?: number;
};

type RecommendProjectsResponse = {
  result?: {
    projects?: RecommendProjectDto[];
    count?: number;
  };
};

/** 추천 페이지 카드용 아이템 (RecommendProjectCard props용) */
export type ProjectListItem = {
  id: string;
  categoryLabel: string;
  deadlineLabel: string;
  title: string;
  thumbnailUrl?: string;
  location: string;
  period: string;
  mode: string;
  dueLabel: string;
  bookmarked?: boolean;
  bookmarkId?: number;
  roles?: ProjectRole[];
  /** 기술스택 매칭 (%) - API techstackScorePercent */
  techstackScorePercent?: number | null;
  /** 리포트 유사도 (%) - API similarityScorePercent */
  similarityScorePercent?: number | null;
  /** 도메인 일치 여부 - API domainMatch */
  domainMatch?: boolean | null;
  /** 종합 점수 - API totalScore */
  totalScore?: number | null;
};

function formatDueLabel(recruitmentDeadline: string = '', daysUntilDeadline: number = 0): string {
  if (daysUntilDeadline <= 0) return '오늘 마감';
  if (daysUntilDeadline === 1) return '내일 마감';
  if (daysUntilDeadline <= 7) return `마감 ${daysUntilDeadline}일 전`;
  if (daysUntilDeadline <= 30) return `마감 ${Math.ceil(daysUntilDeadline / 7)}주 전`;
  return (recruitmentDeadline || '').replace(/-/g, '.').slice(0, 8);
}

/** 상대 경로 이미지 URL을 프로덕션에서 사용할 수 있도록 보정 */
function resolveThumbnailUrl(url: string): string {
  if (!url?.trim()) return url;
  const u = url.trim();
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('/') && BASE_URL) return `${BASE_URL.replace(/\/$/, '')}${u}`;
  return u;
}

/** DTO → 카드용 리스트 아이템 */
export function mapRecommendProjectToListItem(dto: RecommendProjectDto): ProjectListItem {
  const rawThumbnail = dto.thumbnailUrl?.trim();
  const thumbnailUrl = rawThumbnail ? resolveThumbnailUrl(rawThumbnail) : undefined;
  return {
    id: String(dto.projectId),
    categoryLabel: dto.projectFieldName ?? '',
    deadlineLabel: dto.categoryName ?? '',
    title: dto.title ?? '',
    thumbnailUrl: thumbnailUrl ?? undefined,
    location: dto.location ?? '',
    period: dto.durationRangeName ?? '',
    mode: dto.modeName ?? '',
    dueLabel: formatDueLabel(dto.recruitmentDeadline ?? '', dto.daysUntilDeadline ?? 0),
    bookmarked: dto.bookmarked,
    bookmarkId: dto.bookmarkId,
    roles: mapRecommendPositionsToRoles(dto.positions),
    techstackScorePercent: dto.techstackScorePercent ?? null,
    similarityScorePercent: dto.similarityScorePercent ?? null,
    domainMatch: dto.domainMatch ?? null,
    totalScore: dto.totalScore ?? null,
  };
}

export type RecommendProjectsResult = {
  list: ProjectListItem[];
  count: number;
};

/**
 * GET /api/v1/projects/recommend
 * 추천 프로젝트 페이지 조회 (추천 프로젝트 탭용)
 */
export async function getRecommendProjects(
  token: string,
  params: GetRecommendProjectsParams | string = '',
  signal?: AbortSignal,
): Promise<RecommendProjectsResult> {
  const qs =
    typeof params === 'string'
      ? params
      : new URLSearchParams(
          Object.entries(params).flatMap(([k, v]) =>
            Array.isArray(v) ? v.map((vv) => [k, String(vv)]) : [[k, String(v)]],
          ) as [string, string][],
        ).toString();

  const queryString = qs ? (qs.startsWith('?') ? qs : `?${qs}`) : '';

  const res = await fetch(`${BASE_URL}/api/v1/projects/recommend${queryString}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  const json = (await res.json().catch(() => null)) as RecommendProjectsResponse | null;
  if (!res.ok) {
    console.error('[추천 프로젝트 API] 요청 실패', res.status, json);
    const message =
      json && typeof (json as { message?: string }).message === 'string'
        ? (json as { message: string }).message
        : `요청 실패 (${res.status})`;
    throw new Error(message);
  }

  const projects = json?.result?.projects ?? [];
  const list = projects.map(mapRecommendProjectToListItem);
  const count = json?.result?.count ?? list.length;

  return { list, count };
}
