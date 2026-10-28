import type { Domain } from '../../shared/constants/domain';
import DevineDefaultImage from '@assets/images/devine-symbol.png';

export type HomeProject = {
  id: string;
  title: string;
  thumbnail: string;
  domain: Domain;
  memberCount: { current: number; total: number };
  deadline: { remaining: number; date: string };
  status: 'recruiting' | 'inProgress' | 'completed';
  recommendation?: { score: number; reason: string };
  description: string;
  tags: string[];
  techStacks: string[];
  posted?: string;
  introduction: string;
  recruiting: string;
  duration: string;
  workMode: string;
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
    memberCount: { current: 3, total: 5 },
    deadline: { remaining: 5, date: '11.02' },
    status: 'recruiting',
    domain: '기타',
    thumbnail: DevineDefaultImage,
    title: '플로우업',
    description: '팀의 성장을 돕는 올인원 협업 플랫폼',
    tags: ['웹 서비스', '협업'],
    techStacks: ['React', 'TypeScript', 'Node.js'],
    introduction:
      '작은 아이디어가 팀의 성과로 이어지도록, 일정과 업무 그리고 소통을 한곳에 모으는 협업 플랫폼을 만들고 있어요.',
    recruiting: '프론트엔드 개발자 · 백엔드 개발자 · 프로덕트 디자이너',
    duration: '3개월',
    workMode: '온라인',
  },
  {
    id: 'greenlog',
    memberCount: { current: 2, total: 4 },
    deadline: { remaining: 8, date: '11.05' },
    status: 'inProgress',
    domain: '이커머스',
    thumbnail: DevineDefaultImage,
    title: '그린로그',
    description: '지속 가능한 소비를 기록하는 플랫폼',
    tags: ['모바일 앱', '라이프스타일'],
    techStacks: ['React Native', 'TypeScript'],
    introduction:
      '일상의 작은 소비를 기록하고 더 지속 가능한 선택을 함께 발견하는 서비스를 만들어요.',
    recruiting: '앱 개발자 · 프로덕트 디자이너',
    duration: '3~6개월',
    workMode: '온라인',
  },
  {
    id: 'filmoment',
    memberCount: { current: 4, total: 5 },
    deadline: { remaining: 12, date: '11.09' },
    status: 'completed',
    domain: 'AI/데이터',
    thumbnail: DevineDefaultImage,
    title: '필모먼트',
    description: 'AI 기반 영상 자동 편집 서비스',
    tags: ['웹 서비스', 'AI'],
    techStacks: ['Python', 'Django', 'AWS'],
    introduction: '누구나 자신의 순간을 영상으로 남길 수 있도록 AI가 편집을 도와주는 서비스예요.',
    recruiting: '프론트엔드 개발자 · AI 개발자',
    duration: '3개월',
    workMode: '온라인',
  },
  {
    id: 'travel-light',
    memberCount: { current: 1, total: 4 },
    deadline: { remaining: 10, date: '11.07' },
    status: 'recruiting',
    domain: '기타',
    thumbnail: DevineDefaultImage,
    title: '여행, 더 가볍게',
    description: '여행을 쉽고 가볍게 만드는 서비스',
    tags: ['웹 서비스', '여행'],
    techStacks: ['Next.js', 'TypeScript', 'Firebase'],
    introduction:
      '여행 계획부터 기록까지 함께하는 서비스를 만들고 있어요. 복잡한 준비는 줄이고 여행의 즐거움에 집중해요.',
    recruiting: '백엔드 개발자 · 프로덕트 디자이너',
    duration: '3개월',
    workMode: '온·오프라인',
  },
];

export const recommendedDevelopers: HomeDeveloper[] = [
  {
    id: 'yujin',
    name: '정유진',
    role: 'Fullstack Developer',
    skills: ['React', 'Node.js'],
    introduction: '아이디어를 서비스로 구현하는 풀스택 개발자예요.',
    recommendation: {
      source: 'mock',
      reasons: ['플로우업의 React 요구와 일치', 'Node.js 백엔드 기술 보유'],
    },
  },
  {
    id: 'minjun',
    name: '김민준',
    role: 'Frontend Developer',
    skills: ['React', 'TypeScript'],
    introduction: '깔끔한 UI와 사용자 경험을 고민하는 프론트엔드 개발자예요.',
    recommendation: {
      source: 'mock',
      reasons: ['플로우업의 React 요구와 일치', '프론트엔드 모집 직무에 적합'],
    },
  },
  {
    id: 'seoyeon',
    name: '이서연',
    role: 'Backend Developer',
    skills: ['Spring', 'Java'],
    introduction: '안정적이고 확장 가능한 서비스를 만드는 백엔드 개발자예요.',
    recommendation: { source: 'mock', reasons: ['슬로우데이의 Spring 기술과 일치', 'Java 백엔드 기술 보유'] },
  },
  {
    id: 'jihun',
    name: '박지훈',
    role: 'Product Designer',
    skills: ['Figma', 'UI/UX'],
    introduction: '사용자 중심의 경험을 설계하는 프로덕트 디자이너예요.',
    recommendation: {
      source: 'mock',
      reasons: ['그린로그의 디자이너 모집에 적합', 'Figma로 UI/UX 설계 가능'],
    },
  },
];

export const recentProjects: HomeProject[] = [
  {
    id: 'connectup',
    memberCount: { current: 2, total: 5 },
    deadline: { remaining: 6, date: '11.03' },
    status: 'recruiting',
    domain: '소셜/커뮤니티',
    thumbnail: DevineDefaultImage,
    title: '커넥트업',
    description: '개발자 네트워킹 플랫폼',
    tags: ['모바일 앱'],
    techStacks: ['React Native', 'Firebase'],
    posted: '1일 전',
    introduction: '함께 성장할 동료를 찾고 경험을 나누는 개발자 네트워킹 서비스를 만들어요.',
    recruiting: '프론트엔드 개발자 · 백엔드 개발자',
    duration: '3개월',
    workMode: '온라인',
  },
  {
    id: 'slowday',
    memberCount: { current: 3, total: 5 },
    deadline: { remaining: 9, date: '11.06' },
    status: 'inProgress',
    domain: '헬스케어',
    thumbnail: DevineDefaultImage,
    title: '슬로우데이',
    description: '혼자서도 건강하게, 식단 관리 서비스',
    tags: ['웹 서비스'],
    techStacks: ['React', 'Spring', 'MySQL'],
    posted: '1일 전',
    introduction: '바쁜 일상 속에서도 나에게 맞는 건강한 식단을 꾸준히 기록할 수 있는 서비스예요.',
    recruiting: '프론트엔드 개발자 · 프로덕트 디자이너',
    duration: '2개월',
    workMode: '온라인',
  },
  {
    id: 'diarylog',
    memberCount: { current: 1, total: 3 },
    deadline: { remaining: 14, date: '11.11' },
    status: 'completed',
    domain: '교육',
    thumbnail: DevineDefaultImage,
    title: '다이어로그',
    description: '개발자 맞춤형 기술 블로그 플랫폼',
    tags: ['웹 서비스'],
    techStacks: ['Next.js', 'TypeScript', 'Node.js'],
    posted: '2일 전',
    introduction:
      '개발하며 배운 것과 해결한 문제를 편하게 기록하고 나누는 기술 블로그 플랫폼이에요.',
    recruiting: '프론트엔드 개발자 · 백엔드 개발자',
    duration: '3~6개월',
    workMode: '온라인',
  },
  {
    id: 'linknote',
    memberCount: { current: 2, total: 4 },
    deadline: { remaining: 16, date: '11.13' },
    status: 'recruiting',
    domain: '기타',
    thumbnail: DevineDefaultImage,
    title: '링크노트',
    description: '팀을 위한 지식 관리 도구',
    tags: ['웹 서비스'],
    techStacks: ['React', 'Node.js', 'MySQL'],
    posted: '2일 전',
    introduction: '팀에 흩어진 자료와 아이디어를 연결해 필요한 지식을 빠르게 찾는 도구를 만들어요.',
    recruiting: '백엔드 개발자 · 프로덕트 디자이너',
    duration: '3개월',
    workMode: '온라인',
  },
];

// Mock recommendations share project IDs so bookmarks stay consistent across sections.
export const recommendedProjects: HomeProject[] = [
  { ...featuredProjects[0], recommendation: { score: 95, reason: 'React · TypeScript 기술이 일치해요' } },
  { ...recentProjects[0], recommendation: { score: 92, reason: '모바일 서비스에 관심 있는 분께 추천해요' } },
  { ...recentProjects[2], recommendation: { score: 90, reason: '개발 경험을 나누는 프로젝트예요' } },
    { ...recentProjects[3], recommendation: { score: 88, reason: '팀 협업 도구에 관심 있는 분께 추천해요' } },
];

export const editorials = [
  {
    label: 'EDITORIAL',
    sceneTag: 'BUILD TOGETHER',
    sceneCaption: '혼자보다, 함께 더 멀리',
    title: ['함께 만드는', '더 나은 개발 문화'],
    description: ['아이디어가 프로젝트가 되고,', '프로젝트가 새로운 기회로 이어지는 공간.'],
    action: '프로젝트 살펴보기',
    to: '/search/project',
  },
  {
    label: 'PEOPLE',
    sceneTag: 'FIND YOUR PEOPLE',
    sceneCaption: '같은 열정, 새로운 연결',
    title: ['서로의 가능성을', '더 크게 만드는 만남'],
    description: ['나와 같은 열정을 가진 동료와,', '함께 성장할 다음 여정을 시작하세요.'],
    action: '개발자 만나보기',
    to: '/search/developer',
  },
  {
    label: 'PROJECT',
    sceneTag: 'MAKE IT REAL',
    sceneCaption: '작은 아이디어에서 시작되는 가능성',
    title: ['머릿속 아이디어를', '우리의 프로젝트로'],
    description: ['당신의 아이디어에 동료의 경험을 더해,', '다음 가능성을 함께 만들어 보세요.'],
    action: '프로젝트 시작하기',
    to: '/project/create',
  },
];
