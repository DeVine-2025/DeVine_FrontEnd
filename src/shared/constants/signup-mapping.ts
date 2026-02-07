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
  NODEJS: 7,
  MYSQL: 8,
  MONGODB: 9,
  REACT: 10,
  VUEJS: 11,
  NEXTJS: 12,
  FLUTTER: 13,
  SWIFT: 14,
  AWS: 15,
  FIREBASE: 16,
  DOCKER: 17,
  KUBERNETES: 18,
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
