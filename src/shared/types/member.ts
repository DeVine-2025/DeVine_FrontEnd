export const ROLE_PRIORITY = [
  'FRONTEND',
  'BACKEND',
  'FULLSTACK',
  'INFRA',
  'DATA',
  'MOBILE',
] as const;

export type RoleCode = (typeof ROLE_PRIORITY)[number];

export const ROLE_LABEL: Record<RoleCode | 'DEVELOPER', string> = {
  FRONTEND: '프론트엔드',
  BACKEND: '백엔드',
  FULLSTACK: '풀스택',
  INFRA: '인프라',
  DATA: '데이터',
  MOBILE: '모바일',
  DEVELOPER: '개발자',
};

export const DOMAIN_LABEL_TO_CODE = {
  헬스케어: 'HEALTHCARE',
  핀테크: 'FINTECH',
  이커머스: 'ECOMMERCE',
  교육: 'EDUCATION',
  '소셜/커뮤니티': 'SOCIAL',
  엔터테인먼트: 'ENTERTAINMENT',
  'AI/데이터': 'AI_DATA',
  기타: 'ETC',
} as const;

export type MemberSearchCategory = (typeof DOMAIN_LABEL_TO_CODE)[keyof typeof DOMAIN_LABEL_TO_CODE];

export const DOMAIN_CODE_TO_LABEL: Record<MemberSearchCategory, string> = {
  HEALTHCARE: '헬스케어',
  FINTECH: '핀테크',
  ECOMMERCE: '이커머스',
  EDUCATION: '교육',
  SOCIAL: '소셜/커뮤니티',
  ENTERTAINMENT: '엔터테인먼트',
  AI_DATA: 'AI/데이터',
  ETC: '기타',
};
