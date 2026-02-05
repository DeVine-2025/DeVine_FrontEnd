export const DOMAIN_OPTIONS = [
  '교육',
  '헬스케어',
  '소셜/커뮤니티',
  '핀테크',
  '엔터테인먼트',
  '이커머스',
  'AI/데이터',
] as const;

export type Domain = (typeof DOMAIN_OPTIONS)[number];
