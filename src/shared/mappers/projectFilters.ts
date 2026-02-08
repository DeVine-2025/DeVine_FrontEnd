import type {
  AppliedFilters,
  Category,
  DurationRange,
  GetProjectsParams,
  ProjectField,
} from '@t/project/api';

export const PROJECT_TYPE_TO_FIELD: Record<string, ProjectField | undefined> = {
  웹: 'WEB',
  '모바일/앱': 'MOBILE',
  게임: 'GAME',
  블록체인: undefined,
  기타: undefined,
};

export const DOMAIN_LABEL_TO_CATEGORY: Record<string, Category | undefined> = {
  헬스케어: 'HEALTHCARE',
  핀테크: 'FINANCE',
  이커머스: 'ECOMMERCE',
  교육: 'EDUCATION',
  '소셜/커뮤니티': 'SOCIAL',
  엔터테인먼트: 'ENTERTAINMENT',
  'AI/데이터': 'AI',
  기타: 'ETC',
};

export const TECHSTACK_KEY_TO_NAME: Record<string, string | undefined> = {
  JAVA: 'JAVA',
  JAVASCRIPT: 'JAVASCRIPT',
  TYPESCRIPT: 'TYPESCRIPT',
  REACT: 'REACT',
  NEXTJS: 'NEXTJS',
  VUEJS: 'VUEJS',
  SVELTE: 'SVELTE',

  NODEJS: 'NODEJS',
  EXPRESS: 'EXPRESS',
  NESTJS: 'NESTJS',
  SPRING: 'SPRING',
  DJANGO: 'DJANGO',

  MYSQL: 'MYSQL',
  MONGODB: 'MONGODB',

  AWS: 'AWS',
  DOCKER: 'DOCKER',
  KUBERNETES: 'KUBERNETES',
  FIREBASE: 'FIREBASE',
  FLUTTER: 'FLUTTER',
  SWIFT: 'SWIFT',
  KOTLIN: 'KOTLIN',
  PYTHON: 'PYTHON',
  GO: 'GO',
  PHP: 'PHP',
  C: 'C',
};

export const PERIOD_TO_DURATION: Record<string, DurationRange | undefined> = {
  '1개월 이하': 'UNDER_ONE',
  '1~3개월': 'ONE_TO_THREE',
  '3~6개월': 'THREE_TO_SIX',
  '6개월 이상': 'SIX_PLUS',
};

export function buildParams(
  input: AppliedFilters & { page: number; size: number },
): GetProjectsParams {
  // 1) 프로젝트 유형(한글 라벨)
  const projectFields = input.projectTypes
    .map((label) => PROJECT_TYPE_TO_FIELD[label])
    .filter(Boolean) as ProjectField[];

  // 2) 도메인(한글 라벨)
  const categories = input.domains
    .map((label) => DOMAIN_LABEL_TO_CATEGORY[label])
    .filter(Boolean) as Category[];

  // 3) 기술스택(칩 key)
  const techstackNames = input.techStacks
    .map((key) => TECHSTACK_KEY_TO_NAME[key])
    .filter(Boolean) as string[];

  // 4) 예상기간(한글 라벨)
  const durationRange =
    input.expectedPeriods.length > 0
      ? (PERIOD_TO_DURATION[input.expectedPeriods[0]] as DurationRange | undefined)
      : undefined;

  return {
    projectField: projectFields[0],
    category: categories[0],
    techstackName: techstackNames[0],
    durationRange,
    page: input.page,
    size: input.size,
  };
}
