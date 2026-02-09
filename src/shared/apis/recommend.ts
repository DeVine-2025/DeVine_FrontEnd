import { buildQuery } from '@libs/queryString';

const BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

/** GET /api/v1/projects/recommend 쿼리 파라미터 */
export type GetRecommendProjectsParams = {
  projectField?: string; // WEB | MOBILE | AI | GAME | DATA | BACKEND | FRONTEND
  category?: string; // HEALTHCARE | ECOMMERCE | FINANCE | EDUCATION | ENTERTAINMENT | ETC
  position?: string; // BACKEND | FRONTEND | DESIGN | PM | IOS | ANDROID
  techstackName?: string; // JAVA | JAVASCRIPT | REACT | SPRING | PYTHON 등
  durationRange?: string; // UNDER_ONE | ONE_TO_THREE | THREE_TO_SIX | SIX_PLUS
  page?: number;
  size?: number;
};

/** 응답의 result.projects.content[] 한 건 */
export type RecommendProjectDto = {
  projectId: number;
  title: string;
  projectField: string;
  projectFieldName: string;
  categoryName: string;
  mode: string;
  modeName: string;
  durationMonths: number;
  location: string;
  recruitmentDeadline: string;
  daysUntilDeadline: number;
  status: string;
  thumbnailUrl?: string;
  positions: Array<{
    position: string;
    positionName: string;
    count: number;
    currentCount: number;
    techStacks: Array<{ techStack: string }>;
  }>;
  creatorName: string;
  techScore: number;
  domainScore: number;
  techStackCountScore: number;
  totalScore: number;
};

/** result.projects (페이징 + content) */
type RecommendProjectsPage = {
  content: RecommendProjectDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

type RecommendProjectsResponse = {
  result?: { projects?: RecommendProjectsPage };
};

/** 추천 페이지 카드용 아이템 (RecommendProjectCard props용) */
export type ProjectListItem = {
  id: string;
  categoryLabel: string;
  deadlineLabel: string;
  title: string;
  location: string;
  period: string;
  mode: string;
  dueLabel: string;
  bookmarked?: boolean;
  techSuitability?: number;
  domainSuitability?: number;
  growthPotential?: number;
  overallScore?: number;
};

function formatPeriod(months: number): string {
  if (months <= 1) return '1개월 이하';
  if (months <= 3) return '1-3개월';
  if (months <= 6) return '3-6개월';
  return '6개월 이상';
}

function formatDueLabel(recruitmentDeadline: string, daysUntilDeadline: number): string {
  if (daysUntilDeadline <= 0) return '오늘 마감';
  if (daysUntilDeadline === 1) return '내일 마감';
  if (daysUntilDeadline <= 7) return `마감 ${daysUntilDeadline}일 전`;
  if (daysUntilDeadline <= 30) return `마감 ${Math.ceil(daysUntilDeadline / 7)}주 전`;
  return recruitmentDeadline.replace(/-/g, '.').slice(0, 8);
}

/** DTO → 카드용 리스트 아이템 */
export function mapRecommendProjectToListItem(dto: RecommendProjectDto): ProjectListItem {
  return {
    id: String(dto.projectId),
    categoryLabel: dto.projectFieldName ?? '',
    deadlineLabel: dto.categoryName ?? '',
    title: dto.title ?? '',
    location: dto.location ?? '',
    period: formatPeriod(dto.durationMonths),
    mode: dto.modeName ?? '',
    dueLabel: formatDueLabel(dto.recruitmentDeadline, dto.daysUntilDeadline),
    techSuitability: dto.techScore,
    domainSuitability: dto.domainScore,
    growthPotential: dto.techStackCountScore,
    overallScore: dto.totalScore,
  };
}

/** 페이징 정보 */
export type RecommendProjectsResult = {
  list: ProjectListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

/**
 * GET /api/v1/projects/recommend
 * 추천 프로젝트 페이지 조회 (추천 프로젝트 탭용)
 */
export async function getRecommendProjects(
  token: string,
  params?: GetRecommendProjectsParams,
  signal?: AbortSignal,
): Promise<RecommendProjectsResult> {
  const qs = buildQuery({
    projectField: params?.projectField,
    category: params?.category,
    position: params?.position,
    techstackName: params?.techstackName,
    durationRange: params?.durationRange,
    page: params?.page ?? 1,
    size: params?.size ?? 10,
  });

  const res = await fetch(`${BASE_URL}/api/v1/projects/recommend${qs}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  const json = (await res.json().catch(() => null)) as RecommendProjectsResponse | null;
  if (!res.ok) {
    const message =
      json && typeof (json as { message?: string }).message === 'string'
        ? (json as { message: string }).message
        : `요청 실패 (${res.status})`;
    throw new Error(message);
  }

  const projectsPage = json?.result?.projects;
  const content = projectsPage?.content ?? [];
  const list = content.map(mapRecommendProjectToListItem);

  return {
    list,
    page: projectsPage?.page ?? 1,
    size: projectsPage?.size ?? 10,
    totalElements: projectsPage?.totalElements ?? 0,
    totalPages: projectsPage?.totalPages ?? 0,
    first: projectsPage?.first ?? true,
    last: projectsPage?.last ?? true,
  };
}
