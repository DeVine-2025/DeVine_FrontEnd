import type { AppliedFilters, Category, DurationRange, ProjectField } from '@t/project/api.types';

export const PROJECT_TYPE_TO_FIELD: Record<string, ProjectField | undefined> = {
  웹: 'WEB',
  '모바일/앱': 'MOBILE',
  게임: 'GAME',
  블록체인: 'BLOCKCHAIN',
  기타: 'ETC',
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
  VUEJS: 'VUEJS',
  NEXTJS: 'NEXTJS',
  SVELTE: 'SVELTE',
  REACTNATIVE: 'REACT_NATIVE',
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

export const normalizeTechstackKey = (value: string) =>
  value
    .trim()
    .replace(/[^a-z0-9]/gi, '')
    .toUpperCase();

export const PERIOD_TO_DURATION: Record<string, DurationRange | undefined> = {
  '1개월 이하': 'UNDER_ONE',
  '1-3개월': 'ONE_TO_THREE',
  '3-6개월': 'THREE_TO_SIX',
  '6개월 이상': 'SIX_PLUS',
};

const ALL_LABELS = new Set(['ALL', '전체']);

function cleanLabels(values: readonly string[] | undefined) {
  if (!values || values.length === 0) return [];
  return Array.from(new Set(values.map((v) => v.trim()).filter((v) => v && !ALL_LABELS.has(v))));
}

export function buildParams(input: AppliedFilters & { page?: number; size?: number }) {
  const projectFields = cleanLabels(input.projectTypes)
    .map((label) => PROJECT_TYPE_TO_FIELD[label])
    .filter(Boolean) as ProjectField[];

  const categories = cleanLabels(input.domains)
    .map((label) => DOMAIN_LABEL_TO_CATEGORY[label])
    .filter(Boolean) as Category[];

  const techstackNames = cleanLabels(input.techStacks)
    .map((key) => TECHSTACK_KEY_TO_NAME[normalizeTechstackKey(key)])
    .filter(Boolean) as string[];

  const durationRanges = cleanLabels(input.expectedPeriods)
    .map((label) => PERIOD_TO_DURATION[label])
    .filter(Boolean) as DurationRange[];

  const qs = new URLSearchParams();

  // 배열이 비어 있으면 append 안 하니까 “필터 없음(=전체)”로 자연스럽게 동작
  projectFields.forEach((f) => qs.append('projectFields', f));
  categories.forEach((c) => qs.append('categories', c));
  techstackNames.forEach((t) => qs.append('techstackNames', t));
  durationRanges.forEach((d) => qs.append('durationRanges', d));

  if (input.page != null) qs.set('page', String(input.page));
  if (input.size != null) qs.set('size', String(input.size));

  return qs.toString();
}
