import type { AppliedFilters, Category, DurationRange, ProjectField } from '@t/project/api';

export const PROJECT_TYPE_TO_FIELD: Record<string, ProjectField | undefined> = {
  웹: 'WEB',
  '모바일/앱': 'MOBILE',
  게임: 'GAME',
  블록체인: undefined,
  기타: undefined,
};

export const DOMAIN_LABEL_TO_CATEGORY: Record<string, Category | undefined> = {
  헬스케어: 'HEALTHCARE',
  핀테크: 'FINTECH',
  이커머스: 'ECOMMERCE',
  교육: 'EDUCATION',
  '소셜/커뮤니티': 'SOCIAL',
  엔터테인먼트: 'ENTERTAINMENT',
  'AI/데이터': 'AI_DATA',
  기타: 'ETC',
};

export const TECHSTACK_KEY_TO_NAME: Record<string, string | undefined> = {
  JAVASCRIPT: 'JAVASCRIPT',
  TYPESCRIPT: 'TYPESCRIPT',
  REACT: 'REACT',
  NEXTJS: 'NEXTJS',
  VUEJS: 'VUEJS',
  SVELTE: 'SVELTE',
  REACT_NATIVE: 'REACT_NATIVE',
  FLUTTER: 'FLUTTER',
  KOTLIN: 'KOTLIN',
  SWIFT: 'SWIFT',

  JAVA: 'JAVA',
  PYTHON: 'PYTHON',
  GO: 'GO',
  C: 'C',
  PHP: 'PHP',

  SPRINGBOOT: 'SPRINGBOOT',
  NODEJS: 'NODEJS',
  EXPRESS: 'EXPRESS',
  NESTJS: 'NESTJS',
  DJANGO: 'DJANGO',
  MONGODB: 'MONGODB',
  MYSQL: 'MYSQL',

  AWS: 'AWS',
  FIREBASE: 'FIREBASE',
  DOCKER: 'DOCKER',
  KUBERNETES: 'KUBERNETES',
};

export const PERIOD_TO_DURATION: Record<string, DurationRange | undefined> = {
  '1개월 이하': 'UNDER_ONE',
  '1~3개월': 'ONE_TO_THREE',
  '3~6개월': 'THREE_TO_SIX',
  '6개월 이상': 'SIX_PLUS',
};

export function buildParams(input: AppliedFilters & { page: number; size: number }) {
  const projectFields = input.projectTypes
    .map((label) => PROJECT_TYPE_TO_FIELD[label])
    .filter(Boolean) as ProjectField[];

  const categories = input.domains
    .map((label) => DOMAIN_LABEL_TO_CATEGORY[label])
    .filter(Boolean) as Category[];

  const techstackNames = input.techStacks
    .map((key) => TECHSTACK_KEY_TO_NAME[key])
    .filter(Boolean) as string[];

  const durationRange =
    input.expectedPeriods.length > 0
      ? (PERIOD_TO_DURATION[input.expectedPeriods[0]] as DurationRange | undefined)
      : undefined;

  const qs = new URLSearchParams();

  projectFields.forEach((f) => {
    qs.append('projectFields', f);
  });
  categories.forEach((c) => {
    qs.append('categories', c);
  });

  techstackNames.forEach((t) => {
    qs.append('techstackNames', t);
  });

  if (durationRange) qs.set('durationRange', durationRange);

  qs.set('page', String(input.page));
  qs.set('size', String(input.size));

  return qs.toString();
}
