import { featuredProjects, recentProjects, recommendedProjects } from '../home/home-mock-data';
import { positionLabelByKey, type ProjectDetailInfo, type ProjectRoleInfo } from './project-detail-types';

const samplePositions: Omit<ProjectRoleInfo, 'current' | 'total'>[] = [
  { key: 'FRONTEND', label: positionLabelByKey.FRONTEND ?? '프론트엔드', tone: 'blue', techStacks: ['React Native', 'TypeScript'] },
  { key: 'BACKEND', label: positionLabelByKey.BACKEND ?? '백엔드', tone: 'green', techStacks: ['Java', 'Spring Boot', 'MySQL'] },
  { key: 'INFRA', label: positionLabelByKey.INFRA ?? '인프라', tone: 'pink', techStacks: ['AWS', 'Docker'] },
];

const sampleFeatures: Record<string, string[]> = {
  flowup: ['팀 일정과 마감일 관리', '업무 정리와 진행 상황 공유', '팀원 간 소통과 협업'],
  greenlog: ['일상 소비 기록', '지속 가능한 소비 현황 확인', '친환경 소비를 위한 정보 제공'],
  filmoment: ['영상 자동 편집', 'AI 기반 장면 분석', '편집 결과 미리보기'],
  'travel-light': ['여행 계획 정리', '여행 정보 탐색', '일정 공유'],
  connectup: ['프로젝트 팀원 탐색', '개발자 네트워킹', '프로젝트 경험 공유'],
  slowday: ['건강한 생활 습관 기록', '식단 관리', '일상 활동 확인'],
  diarylog: ['기술 글 작성과 관리', '개발 지식 탐색', '블로그 콘텐츠 공유'],
  linknote: ['팀 지식과 자료 정리', '링크 수집', '팀원과 자료 공유'],
};

export function getSampleProjectDetail(id: string | undefined): ProjectDetailInfo | null {
  if (!id?.startsWith('sample-')) return null;
  const item = [...featuredProjects, ...recentProjects, ...recommendedProjects].find(project => project.id === id.slice(7));
  if (!item) return null;
  // Distribute mock seats and joined members in the same order so the role totals match the project.
  const { current, total } = item.memberCount;
  const roles = samplePositions.map((role, index) => ({
    ...role,
    current: Math.floor((current + samplePositions.length - 1 - index) / samplePositions.length),
    total: Math.floor((total + samplePositions.length - 1 - index) / samplePositions.length),
  }));
  return {
    id, title: item.title, deadlineLabel: item.domain, summary: item.introduction, description: item.description, memberCount: item.memberCount,
    features: sampleFeatures[item.id],
    categoryLabel: item.tags[0], mode: item.workMode, period: item.duration,
    dueLabel: item.deadline.remaining === 0 ? 'D-Day' : `D-${item.deadline.remaining}`,
    recruitmentDate: item.deadline.date,
    imageUrls: [item.thumbnail, item.thumbnail, item.thumbnail],
    status: item.status === 'recruiting' ? 'RECRUITING' : item.status === 'inProgress' ? 'IN_PROGRESS' : 'COMPLETED',
    roles,
  };
}
