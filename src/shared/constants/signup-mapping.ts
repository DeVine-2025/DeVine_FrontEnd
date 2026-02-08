const CATEGORY_ID_BY_LABEL: Record<string, number> = {
  '헬스케어': 1,
  '이커머스': 2,
  '핀테크': 3,
  '교육': 4,
  '엔터테인먼트': 5,
  '소셜/커뮤니티': 6,
  'AI/데이터': 6,
};

const TECHSTACK_ID_BY_KEY: Record<string, number> = {
  BACKEND: 1,
  FRONTEND: 2,
  INFRA: 3,
  JAVA: 4,
  PYTHON: 5,
  SPRINGBOOT: 6,
  NODEJS: 21,
  MYSQL: 7,
  MONGODB: 23,
  JAVASCRIPT: 8,
  REACT: 9,
  VUEJS: 25,
  NEXTJS: 10,
  FLUTTER: 27,
  SWIFT: 28,
  AWS: 11,
  FIREBASE: 30,
  DOCKER: 12,
  KUBERNETES: 32,
  GO: 33,
  C: 34,
  PHP: 35,
  EXPRESS: 36,
  DJANGO: 37,
  TYPESCRIPT: 38,
  SVELTE: 39,
  REACTNATIVE: 40,
  KOTLIN: 41,
};

const normalizeTechName = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '');

export const getCategoryIdsByLabels = (labels: string[]) =>
  labels.map((label) => CATEGORY_ID_BY_LABEL[label]).filter((id): id is number => Boolean(id));

export const getTechstackIdsByKeys = (keys: string[]) =>
  keys
    .map((key) => TECHSTACK_ID_BY_KEY[normalizeTechName(key)])
    .filter((id): id is number => Boolean(id));
