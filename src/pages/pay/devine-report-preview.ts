import type { ReportMainContent } from '@apis/report/report';

// 구매 화면에서 형식을 보여주기 위한 예시이며 실제 분석 결과가 아닙니다.
export const devineReportPreview: ReportMainContent = {
  projectInfo: { projectName: 'DeVine', scale: '12,000줄 | 120개 파일 | 약 6개월', techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'] },
  overview: {
    summary: 'GitHub 프로젝트 분석을 바탕으로 개발자와 사이드 프로젝트를 연결하는 플랫폼입니다.',
    mainTech: 'React와 TypeScript를 활용해 탐색과 리포트 화면을 구성합니다.',
    scale: '',
    capabilities: ['검색·필터 기반 프로젝트 탐색', '프로젝트 분석 리포트 표시'],
  },
  keyImplementations: [
    { title: '프로젝트와 개발자 탐색', description: '검색과 필터로 관심 있는 프로젝트와 팀원을 찾습니다.', capabilities: ['조건에 맞는 결과 탐색', '목록과 그리드 보기 전환'] },
  ],
  aiEvaluation: [
    { title: '서비스 경험', details: ['탐색과 프로젝트 분석을 연결하는 사용자 흐름을 구성했습니다.'] },
  ],
  recommendations: ['프로젝트 탐색과 팀원 연결 서비스', '개발 경험을 분석하고 소개하는 서비스'],
};
