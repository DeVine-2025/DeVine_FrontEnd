export type HomeProject = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  posted?: string;
  introduction: string;
  recruiting: string;
};

export type HomeDeveloper = {
  id: string;
  name: string;
  role: string;
  skills: string[];
  introduction: string;
  recommendation?: {
    source: 'mock' | 'algorithm';
    reasons: string[];
  };
};

// Independent mock data for the new home. Replace this module when connecting APIs.
export const featuredProjects: HomeProject[] = [
  {
    id: 'flowup',
    title: '플로우업',
    description: '팀의 성장을 돕는 올인원 협업 플랫폼',
    tags: ['웹 서비스', '협업'],
    introduction:
      '작은 아이디어가 팀의 성과로 이어지도록, 일정과 업무 그리고 소통을 한곳에 모으는 협업 플랫폼을 만들고 있어요.',
    recruiting: '프론트엔드 개발자 · 백엔드 개발자 · 프로덕트 디자이너',
  },
  {
    id: 'greenlog',
    title: '그린로그',
    description: '지속 가능한 소비를 기록하는 플랫폼',
    tags: ['모바일 앱', '라이프스타일'],
    introduction:
      '일상의 작은 소비를 기록하고 더 지속 가능한 선택을 함께 발견하는 서비스를 만들어요.',
    recruiting: '앱 개발자 · 프로덕트 디자이너',
  },
  {
    id: 'filmoment',
    title: '필모먼트',
    description: 'AI 기반 영상 자동 편집 서비스',
    tags: ['웹 서비스', 'AI'],
    introduction: '누구나 자신의 순간을 영상으로 남길 수 있도록 AI가 편집을 도와주는 서비스예요.',
    recruiting: '프론트엔드 개발자 · AI 개발자',
  },
  {
    id: 'travel-light',
    title: '여행, 더 가볍게',
    description: '여행을 쉽고 가볍게 만드는 서비스',
    tags: ['웹 서비스', '여행'],
    introduction:
      '여행 계획부터 기록까지 함께하는 서비스를 만들고 있어요. 복잡한 준비는 줄이고 여행의 즐거움에 집중해요.',
    recruiting: '백엔드 개발자 · 프로덕트 디자이너',
  },
];

export const recommendedDevelopers: HomeDeveloper[] = [
  {
    id: 'minjun',
    name: '김민준',
    role: 'Frontend Developer',
    skills: ['React', 'TypeScript'],
    introduction: '깔끔한 UI와 사용자 경험을 고민하는 프론트엔드 개발자예요.',
    recommendation: {
      source: 'mock',
      reasons: ['관심 기술 React 일치', '선호 직무 프론트엔드 일치'],
    },
  },
  {
    id: 'seoyeon',
    name: '이서연',
    role: 'Backend Developer',
    skills: ['Spring', 'Java'],
    introduction: '안정적이고 확장 가능한 서비스를 만드는 백엔드 개발자예요.',
    recommendation: { source: 'mock', reasons: ['관심 기술 Spring 일치', '선호 직무 백엔드 일치'] },
  },
  {
    id: 'jihun',
    name: '박지훈',
    role: 'Product Designer',
    skills: ['Figma', 'UI/UX'],
    introduction: '사용자 중심의 경험을 설계하는 프로덕트 디자이너예요.',
    recommendation: {
      source: 'mock',
      reasons: ['관심 분야 UI/UX 일치', '선호 직무 프로덕트 디자인 일치'],
    },
  },
];

export const recentProjects: HomeProject[] = [
  {
    id: 'connectup',
    title: '커넥트업',
    description: '개발자 네트워킹 플랫폼',
    tags: ['모바일 앱'],
    posted: '1일 전',
    introduction: '함께 성장할 동료를 찾고 경험을 나누는 개발자 네트워킹 서비스를 만들어요.',
    recruiting: '프론트엔드 개발자 · 백엔드 개발자',
  },
  {
    id: 'slowday',
    title: '슬로우데이',
    description: '혼자서도 건강하게, 식단 관리 서비스',
    tags: ['웹 서비스'],
    posted: '1일 전',
    introduction: '바쁜 일상 속에서도 나에게 맞는 건강한 식단을 꾸준히 기록할 수 있는 서비스예요.',
    recruiting: '프론트엔드 개발자 · 프로덕트 디자이너',
  },
  {
    id: 'diarylog',
    title: '다이어로그',
    description: '개발자 맞춤형 기술 블로그 플랫폼',
    tags: ['웹 서비스'],
    posted: '2일 전',
    introduction:
      '개발하며 배운 것과 해결한 문제를 편하게 기록하고 나누는 기술 블로그 플랫폼이에요.',
    recruiting: '프론트엔드 개발자 · 백엔드 개발자',
  },
  {
    id: 'linknote',
    title: '링크노트',
    description: '팀을 위한 지식 관리 도구',
    tags: ['웹 서비스'],
    posted: '2일 전',
    introduction: '팀에 흩어진 자료와 아이디어를 연결해 필요한 지식을 빠르게 찾는 도구를 만들어요.',
    recruiting: '백엔드 개발자 · 프로덕트 디자이너',
  },
];

export const editorials = [
  {
    label: 'EDITORIAL',
    title: ['함께 만드는', '더 나은 개발 문화'],
    description: ['아이디어가 프로젝트가 되고,', '프로젝트가 새로운 기회로 이어지는 공간.'],
    action: '프로젝트 살펴보기',
    to: '/search/project',
  },
  {
    label: 'PEOPLE',
    title: ['서로의 가능성을', '더 크게 만드는 만남'],
    description: ['나와 같은 열정을 가진 동료와,', '함께 성장할 다음 여정을 시작하세요.'],
    action: '개발자 만나보기',
    to: '/search/developer',
  },
  {
    label: 'PROJECT',
    title: ['머릿속 아이디어를', '우리의 프로젝트로'],
    description: ['당신의 아이디어에 동료의 경험을 더해,', '다음 가능성을 함께 만들어 보세요.'],
    action: '프로젝트 시작하기',
    to: '/project/create',
  },
];
