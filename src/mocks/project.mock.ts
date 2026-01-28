// 추천 프로젝트 (상단 카드)
export type RecommendedProject = {
  id: string;
  categoryLabel: string;
  deadlineLabel: string;
  title: string;
  location: string;
  period: string;
  mode: string;
  bookmarked?: boolean;
};

export const RECOMMENDED_PROJECTS: RecommendedProject[] = [
  {
    id: 'rec-1',
    categoryLabel: '모바일/앱',
    deadlineLabel: '라이프스타일',
    title: '프로젝트 제목이 들어가는 자리입니다. 프로젝트 제목이 들어가는 자리입니다.',
    location: '서울 강남구',
    period: '3개월',
    mode: '온라인/오프라인',
    bookmarked: false,
  },
  {
    id: 'rec-2',
    categoryLabel: '모바일/앱',
    deadlineLabel: '라이프스타일',
    title: '프로젝트 제목이 들어가는 자리입니다. 프로젝트 제목이 들어가는 자리입니다.',
    location: '서울 강남구',
    period: '3개월',
    mode: '온라인/오프라인',
    bookmarked: false,
  },
  {
    id: 'rec-3',
    categoryLabel: '모바일/앱',
    deadlineLabel: '라이프스타일',
    title: '프로젝트 제목이 들어가는 자리입니다. 프로젝트 제목이 들어가는 자리입니다.',
    location: '서울 강남구',
    period: '3개월',
    mode: '온라인/오프라인',
    bookmarked: false,
  },
  {
    id: 'rec-4',
    categoryLabel: '모바일/앱',
    deadlineLabel: '라이프스타일',
    title: '프로젝트 제목이 들어가는 자리입니다. 프로젝트 제목이 들어가는 자리입니다.',
    location: '서울 강남구',
    period: '3개월',
    mode: '온라인/오프라인',
    bookmarked: false,
  },
];

// 필터 라벨
export const PROJECT_FILTERS = [
  '프로젝트 유형',
  '도메인',
  '포지션 / 기술스택',
  '예상 기간',
] as const;

// 리스트용 프로젝트 (추천 페이지용 적합도 필드 포함)
export type ProjectListItem = {
  id: string;
  categoryLabel: string;
  deadlineLabel: string;
  title: string;
  location: string;
  period: string;
  mode: string;
  dueLabel: string;
  bookmarked?: boolean;
  techSuitability?: number;
  domainSuitability?: number;
  growthPotential?: number;
  overallScore?: number;
};

export const PROJECT_LIST: ProjectListItem[] = [
  {
    id: 'p-1',
    categoryLabel: '모바일/앱',
    deadlineLabel: '라이프스타일',
    title: '헬스케어 습관 관리 앱 MVP 개발',
    location: '서울 강남구',
    period: '3개월',
    mode: '온라인/오프라인',
    dueLabel: '오늘 마감',
    bookmarked: false,
    techSuitability: 4,
    domainSuitability: 4,
    growthPotential: 3,
    overallScore: 95,
  },
  {
    id: 'p-2',
    categoryLabel: '웹 서비스',
    deadlineLabel: '핀테크',
    title: '개인 자산 관리 대시보드 웹 서비스',
    location: '서울 서초구',
    period: '4개월',
    mode: '온라인',
    dueLabel: '오늘 마감',
    bookmarked: true,
    techSuitability: 5,
    domainSuitability: 4,
    growthPotential: 4,
    overallScore: 92,
  },
  {
    id: 'p-3',
    categoryLabel: '모바일/앱',
    deadlineLabel: '커머스',
    title: '중고 거래 플랫폼 앱 고도화 프로젝트',
    location: '서울 송파구',
    period: '2개월',
    mode: '온라인/오프라인',
    dueLabel: '마감 7일 전',
    bookmarked: false,
    techSuitability: 3,
    domainSuitability: 5,
    growthPotential: 4,
    overallScore: 88,
  },
  {
    id: 'p-4',
    categoryLabel: '웹 서비스',
    deadlineLabel: '교육',
    title: '온라인 코딩 교육 플랫폼 프론트엔드 개발',
    location: '경기 성남시',
    period: '3개월',
    mode: '온라인',
    dueLabel: '26.01.05.',
    bookmarked: false,
    techSuitability: 4,
    domainSuitability: 3,
    growthPotential: 5,
    overallScore: 90,
  },
  {
    id: 'p-5',
    categoryLabel: '모바일/앱',
    deadlineLabel: '여행',
    title: '여행 일정 자동 추천 앱 개발',
    location: '부산 해운대구',
    period: '2개월',
    mode: '온라인',
    dueLabel: '마감 3일 전',
    bookmarked: true,
    techSuitability: 4,
    domainSuitability: 4,
    growthPotential: 3,
    overallScore: 85,
  },
  {
    id: 'p-6',
    categoryLabel: '웹 서비스',
    deadlineLabel: '엔터테인먼트',
    title: '공연 예매 및 추천 웹 플랫폼 구축',
    location: '서울 마포구',
    period: '5개월',
    mode: '온라인/오프라인',
    dueLabel: '마감 10일 전',
    bookmarked: false,
    techSuitability: 3,
    domainSuitability: 5,
    growthPotential: 4,
    overallScore: 87,
  },
  {
    id: 'p-7',
    categoryLabel: '모바일/앱',
    deadlineLabel: '소셜',
    title: '취향 기반 소셜 네트워크 앱 개발',
    location: '대전 유성구',
    period: '3개월',
    mode: '온라인',
    dueLabel: '26.01.12.',
    bookmarked: false,
    techSuitability: 5,
    domainSuitability: 4,
    growthPotential: 4,
    overallScore: 91,
  },
  {
    id: 'p-8',
    categoryLabel: '웹 서비스',
    deadlineLabel: 'B2B',
    title: '사내 협업 툴 웹 서비스 개발',
    location: '서울 영등포구',
    period: '6개월',
    mode: '오프라인',
    dueLabel: '마감 14일 전',
    bookmarked: true,
    techSuitability: 4,
    domainSuitability: 4,
    growthPotential: 3,
    overallScore: 89,
  },
  {
    id: 'p-9',
    categoryLabel: '모바일/앱',
    deadlineLabel: '헬스케어',
    title: '운동 기록 및 분석 모바일 앱',
    location: '인천 연수구',
    period: '2개월',
    mode: '온라인',
    dueLabel: '26.01.20.',
    bookmarked: false,
    techSuitability: 4,
    domainSuitability: 5,
    growthPotential: 5,
    overallScore: 93,
  },
  {
    id: 'p-10',
    categoryLabel: '웹 서비스',
    deadlineLabel: '스타트업',
    title: '초기 스타트업 랜딩 페이지 및 CMS 구축',
    location: '서울 종로구',
    period: '1개월',
    mode: '온라인',
    dueLabel: '마감 5일 전',
    bookmarked: false,
    techSuitability: 3,
    domainSuitability: 3,
    growthPotential: 5,
    overallScore: 82,
  },
];

// 공통 역할 (ProjectLg용)
export const PROJECT_ROLES = [
  {
    key: 'fe',
    label: '프론트엔드',
    tone: 'blue',
    current: 2,
    total: 6,
    techStack: [],
  },
  {
    key: 'be',
    label: '백엔드',
    tone: 'green',
    current: 2,
    total: 3,
    techStack: [],
  },
  {
    key: 'infra',
    label: '인프라',
    tone: 'pink',
    current: 2,
    total: 3,
    techStack: [],
  },
] as const;
