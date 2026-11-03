import type { ReportMain, ReportDetail } from '@apis/report/report';
/** Development preview transcribed from the existing Eternal-FE report. */
export const sampleMainReport: ReportMain = {
  reportId: 0, gitRepoId: 0, gitRepoUrl: '', reportType: 'MAIN', visibility: 'PRIVATE', createdAt: '', completedAt: '',
  content: {
    projectInfo: { projectName: 'Eternal-FE', scale: '12223줄 | 82개 파일 | 약 4개월 개발 기간', techStack: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Tiptap (리치 텍스트 에디터)', 'Heroicons', 'Sharp (이미지 처리)', 'Google APIs (관리자 인증 및 서비스 연동)', 'CountUp (숫자 애니메이션)'] },
    overview: {
      summary: '이터널마케팅의 AI 기반 마케팅 솔루션을 소개하는 프론트엔드 웹사이트 프로젝트입니다. 비효율적인 마케팅 구조를 개선하고, 데이터 기반의 맞춤형 전략을 제공하여 고객의 매출 증대와 브랜드 인지도 향상을 목표로 합니다.',
      mainTech: 'Next.js 프레임워크 기반의 반응형 프론트엔드 개발 (TypeScript, React)', scale: '',
      capabilities: ['Next.js 기반의 컴포넌트 중심 프론트엔드 개발', 'Tailwind CSS를 활용한 반응형 UI/UX 구현', 'API 연동을 통한 AI 진단 및 관리 시스템 구축', '검색 엔진 최적화(SEO) 및 메타데이터 관리', 'Tiptap 리치 텍스트 에디터 통합 및 콘텐츠 관리 기능 구현'],
    },
    keyImplementations: [
      { title: 'AI 진단 시스템 및 관리자 기능 연동', description: 'AI 기반 마케팅 진단 신청 폼을 개발하고, 사용자 입력 데이터를 저장하는 API와 연동했습니다. 관리자 대시보드를 통해 신청 현황을 파악하고 일일 진단 건수 설정을 관리하는 기능을 구현하여, 서비스 운영 효율성을 높였습니다.', capabilities: ['API 연동 및 데이터 처리', '폼 유효성 검사 및 사용자 피드백', '관리자 인터페이스 개발', '데이터 기반 서비스 운영 지원'] },
      { title: '반응형 UI 및 디자인 시스템 구현', description: 'Tailwind CSS를 활용하여 메인, ABOUT, SERVICE 등 핵심 마케팅 페이지의 반응형 UI를 구현했습니다. 모바일, 태블릿, 데스크톱 등 다양한 디바이스에서 최적의 사용자 경험을 제공하며, 섬세한 스크롤 애니메이션과 같은 디자인 요소를 적용했습니다.', capabilities: ['반응형 웹 디자인 적용', 'UI/UX 디자인 원칙 구현', '애니메이션 및 인터랙션 처리', '디자인 시스템 기반 개발'] },
      { title: 'SEO 최적화 및 메타데이터 관리', description: '검색 엔진 최적화를 위해 Next.js의 기능을 활용하여 각 페이지에 대한 동적 및 정적 메타데이터를 설정했습니다. sitemap.xml과 robots.txt 파일을 통해 검색 엔진 크롤링을 효과적으로 제어하고, JSON-LD 스키마 마크업을 추가하여 검색 결과 가시성을 높였습니다.', capabilities: ['Next.js SEO 설정', '동적 메타데이터 관리', '사이트맵 및 로봇츠 관리', 'JSON-LD 구조화된 데이터 적용'] },
      { title: '컬럼 게시판 및 리치 텍스트 에디터', description: '마케팅 칼럼을 생성, 조회, 수정, 삭제할 수 있는 CRUD 기능을 구현했습니다. 칼럼 본문 작성 시 Tiptap 리치 텍스트 에디터를 통합하여 사용자 친화적인 콘텐츠 작성 환경을 제공하며, 이미지 업로드 및 붙여넣기 시 텍스트 처리 로직을 추가했습니다.', capabilities: ['CRUD 기능 개발', '리치 텍스트 에디터 통합', '콘텐츠 이미지 관리', '동적 콘텐츠 라우팅 구현'] },
    ],
    aiEvaluation: [
      { title: '프론트엔드 전문성', details: ['Next.js, React, TypeScript를 활용하여 SSR/SSG 혼합 렌더링 전략을 이해하고 컴포넌트 기반 개발에 능숙합니다.', '파일 기반 라우팅, 동적 라우팅 등 Next.js의 핵심 기능을 적극적으로 활용하여 프로젝트 구조를 설계했습니다.', '종합적인 기술 스택을 활용하여 이터널마케팅 웹사이트의 핵심 기능들을 안정적으로 구현했습니다.'] },
      { title: 'UI/UX 구현 및 최적화 역량', details: ['Tailwind CSS를 이용한 반응형 디자인 및 섬세한 애니메이션 구현으로 사용자 경험을 중시하는 개발 능력을 갖췄습니다.', '이미지 및 비디오 로딩 최적화, 다이내믹 임포트 등을 통해 모바일 환경에서의 초기 로딩 성능을 개선했습니다.', '다양한 페이지에서 일관된 디자인 시스템을 적용하여 브랜드 아이덴티티를 효과적으로 전달합니다.'] },
      { title: '프로젝트 기여도 및 책임감', details: ['총 커밋 수 97개 중 67개, 기여율 69.1%로 프로젝트의 핵심적인 부분에 기여했습니다.', '35,892줄 추가, 10,297줄 삭제, 258개 파일 수정 등 광범위한 코드 변경을 통해 프로젝트 전반에 걸친 높은 참여도를 보였습니다.', 'SEO, 관리자 기능, UI/UX 개선 등 다양한 영역에서 주도적인 개발을 수행하며 프로젝트 완수에 대한 높은 책임감을 증명했습니다.'] },
    ],
    recommendations: ['웹 프론트엔드 개발', '마케팅 SaaS 솔루션 개발', '콘텐츠 관리 시스템(CMS) 개발'],
  },
};

/** Design fixture derived from the existing Eternal-FE main report, not a new analysis. */
export const sampleDetailReport: ReportDetail = {
  reportId: 0, gitRepoId: 0, gitRepoUrl: '', reportType: 'DETAIL', visibility: 'PRIVATE', createdAt: '', completedAt: '',
  content: {
    reportTitle: 'Eternal-FE', reportSubtitle: '이터널마케팅 웹사이트 상세 분석',
    projectOverview: {
      purpose: sampleMainReport.content.overview.summary,
      projectScale: { totalCodeLines: 12223, mainCodeFiles: 82, developmentPeriod: '약 4개월', architecturePattern: 'Next.js 기반 컴포넌트 중심의 프론트엔드 구조' },
      techStack: [
        { title: '언어', content: 'TypeScript' },
        { title: '프레임워크', content: 'Next.js · React' },
        { title: '스타일링', content: 'Tailwind CSS' },
        { title: '라이브러리', content: 'Tiptap · Heroicons · Sharp · CountUp' },
        { title: '외부 서비스', content: 'Google APIs' },
      ],
    },
    implementedFeatures: sampleMainReport.content.keyImplementations.map((item, index) => ({ categoryNumber: index + 1, category: item.title, features: [{ name: item.title, details: [item.description], codeLocation: [], implementation: item.capabilities }] })),
    codeInsights: sampleMainReport.content.aiEvaluation.map((item, index) => ({ number: index + 1, title: item.title, points: item.details, codeLocation: [] })),
    projectSummary: { implemented: sampleMainReport.content.keyImplementations.map(item => item.title), notImplemented: ['기존 메인 리포트에 미구현 항목이 명시되어 있지 않습니다.'] },
    improvements: [],
    nextSteps: sampleMainReport.content.recommendations.map((title, index) => ({ number: index + 1, title, description: ['기존 프로젝트 경험을 활용할 수 있는 추천 분야입니다.'], recommendKeyword: [] })),
  },
};
