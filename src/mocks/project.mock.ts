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
    bookmarked: true,
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

// 리스트용 프로젝트
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
};

export const PROJECT_LIST: ProjectListItem[] = [
  {
    id: 'p-1',
    categoryLabel: '모바일/앱',
    deadlineLabel: '라이프스타일',
    title: '프로젝트 제목이 들어가는 자리입니다. 프로젝트 제목이 들어가는 자리입니다.',
    location: '서울 강남구',
    period: '3개월',
    mode: '온라인/오프라인',
    dueLabel: '오늘 마감',
    bookmarked: false,
  },
  {
    id: 'p-2',
    categoryLabel: '모바일/앱',
    deadlineLabel: '라이프스타일',
    title: '프로젝트 제목이 들어가는 자리입니다. 프로젝트 제목이 들어가는 자리입니다.',
    location: '서울 강남구',
    period: '3개월',
    mode: '온라인/오프라인',
    dueLabel: '오늘 마감',
    bookmarked: true,
  },
  {
    id: 'p-3',
    categoryLabel: '모바일/앱',
    deadlineLabel: '라이프스타일',
    title: '프로젝트 제목이 들어가는 자리입니다. 프로젝트 제목이 들어가는 자리입니다.',
    location: '서울 강남구',
    period: '3개월',
    mode: '온라인/오프라인',
    dueLabel: '마감 7일 전',
    bookmarked: false,
  },
  {
    id: 'p-4',
    categoryLabel: '모바일/앱',
    deadlineLabel: '라이프스타일',
    title: '프로젝트 제목이 들어가는 자리입니다. 프로젝트 제목이 들어가는 자리입니다.',
    location: '서울 강남구',
    period: '3개월',
    mode: '온라인/오프라인',
    dueLabel: '26.01.05.',
    bookmarked: false,
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
