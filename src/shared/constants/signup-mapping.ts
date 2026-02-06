const CATEGORY_NAME_BY_LABEL: Record<string, string> = {
  '헬스케어': 'HEALTHCARE',
  '이커머스': 'ECOMMERCE',
  '핀테크': 'FINANCE',
  '교육': 'EDUCATION',
  '엔터테인먼트': 'ENTERTAINMENT',
  '소셜/커뮤니티': 'SOCIAL',
  'AI/데이터': 'AI',
};

const TECHSTACK_NAME_BY_KEY: Record<string, string> = {
  BACKEND: 'BACKEND',
  FRONTEND: 'FRONTEND',
  INFRA: 'INFRA',
  JAVA: 'JAVA',
  PYTHON: 'PYTHON',
  GO: 'GO',
  C: 'C',
  KOTLIN: 'KOTLIN',
  PHP: 'PHP',
  SPRINGBOOT: 'SPRINGBOOT',
  NODEJS: 'NODEJS',
  EXPRESS: 'EXPRESS',
  NESTJS: 'NESTJS',
  DJANGO: 'DJANGO',
  MONGODB: 'MONGODB',
  MYSQL: 'MYSQL',
  JAVASCRIPT: 'JAVASCRIPT',
  TYPESCRIPT: 'TYPESCRIPT',
  REACT: 'REACT',
  VUEJS: 'VUEJS',
  NEXTJS: 'NEXTJS',
  REACTNATIVE: 'REACT_NATIVE',
  FLUTTER: 'FLUTTER',
  SWIFT: 'SWIFT',
  AWS: 'AWS',
  FIREBASE: 'FIREBASE',
  DOCKER: 'DOCKER',
  KUBERNETES: 'KUBERNETES',
};

const normalizeTechName = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '');

export const getCategoryNamesByLabels = (labels: string[]) =>
  labels
    .map((label) => CATEGORY_NAME_BY_LABEL[label])
    .filter((name): name is string => Boolean(name));

export const getTechstackNamesByKeys = (keys: string[]) =>
  keys
    .map((key) => TECHSTACK_NAME_BY_KEY[normalizeTechName(key)])
    .filter((name): name is string => Boolean(name));
