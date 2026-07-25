export const ADMIN_BASE_PATH = '/admin';

export const ADMIN_MENU = [
  { label: '홈', path: '/admin/dashboard' },
  { label: '신고관리', path: '/admin/reports' },
  { label: '쿠폰관리', path: '/admin/coupons' },
  { label: '유저관리', path: '/admin/users' },
  { label: '결제관리', path: '/admin/payments' },
  { label: '콘텐츠관리', path: '/admin/contents' },
  { label: '시스템 설정', path: '/admin/settings' },
] as const;
