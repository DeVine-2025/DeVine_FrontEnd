export const DOMAIN_OPTIONS = [
  '교육',
  '헬스케어',
  '소셜/커뮤니티',
  '핀테크',
  '엔터테인먼트',
  '이커머스',
  'AI/데이터',
  '기타',
] as const;

export type Domain = (typeof DOMAIN_OPTIONS)[number];

// 한글 -> 영문 매핑
export const DOMAIN_MAP: Record<string, string> = {
  '헬스케어': 'HEALTHCARE',
  '핀테크': 'FINTECH',
  '이커머스': 'ECOMMERCE',
  '교육': 'EDUCATION',
  '소셜/커뮤니티': 'SOCIAL',
  '엔터테인먼트': 'ENTERTAINMENT',
  'AI/데이터': 'AI_DATA',
  '기타': 'ETC',
};

// 영문 -> 한글 매핑
export const DOMAIN_REVERSE_MAP: Record<string, string> = {
  'HEALTHCARE': '헬스케어',
  'FINTECH': '핀테크',
  'ECOMMERCE': '이커머스',
  'EDUCATION': '교육',
  'SOCIAL': '소셜/커뮤니티',
  'ENTERTAINMENT': '엔터테인먼트',
  'AI_DATA': 'AI/데이터',
  'ETC': '기타',
};
