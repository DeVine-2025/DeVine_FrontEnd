import ProjectDeveloperFilter from '@components/common/ProjectDeveloperFilter';
import SuggetsedProject from '@components/common/SuggetsedProject';
import type { SuggetsedProjectProps } from '@components/common/SuggetsedProject';

const RecommendProjectPage = () => {
  // 더미 데이터 배열
  const projects: SuggetsedProjectProps[] = [
    {
      id: '1',
      categoryLabels: ['모바일/앱', '라이프스타일'],
      title: '프로젝트 제목이 들어가는 자리입니다. 프로젝트 제목이 들어가는 자리입니다.',
      location: '서울 강남구',
      period: '3개월',
      mode: '온라인/오프라인',
      roles: [
        {
          key: 'frontend',
          label: '프론트엔드',
          tone: 'blue',
          current: 2,
          total: 6,
        },
        {
          key: 'backend',
          label: '백엔드',
          tone: 'green',
          current: 2,
          total: 3,
        },
        {
          key: 'infra',
          label: '인프라',
          tone: 'pink',
          current: 2,
          total: 3,
        },
      ],
      techSuitability: 4,
      domainSuitability: 4,
      growthPotential: 3,
      overallScore: 95,
      deadlineText: '오늘 마감',
      bookmarked: false,
    },
    {
      id: '2',
      categoryLabels: ['모바일/앱', '라이프스타일'],
      title: '프로젝트 제목이 들어가는 자리입니다. 프로젝트 제목이 들어가는 자리입니다.',
      location: '서울 강남구',
      period: '3개월',
      mode: '온라인/오프라인',
      roles: [
        {
          key: 'frontend',
          label: '프론트엔드',
          tone: 'blue',
          current: 2,
          total: 6,
        },
        {
          key: 'backend',
          label: '백엔드',
          tone: 'green',
          current: 2,
          total: 3,
        },
        {
          key: 'infra',
          label: '인프라',
          tone: 'pink',
          current: 2,
          total: 3,
        },
      ],
      techSuitability: 4,
      domainSuitability: 4,
      growthPotential: 3,
      overallScore: 95,
      deadlineText: '마감 7일 전',
      bookmarked: false,
    },
    {
      id: '3',
      categoryLabels: ['모바일/앱', '라이프스타일'],
      title: '프로젝트 제목이 들어가는 자리입니다. 프로젝트 제목이 들어가는 자리입니다.',
      location: '서울 강남구',
      period: '3개월',
      mode: '온라인/오프라인',
      roles: [
        {
          key: 'frontend',
          label: '프론트엔드',
          tone: 'blue',
          current: 2,
          total: 6,
        },
        {
          key: 'backend',
          label: '백엔드',
          tone: 'green',
          current: 2,
          total: 3,
        },
        {
          key: 'infra',
          label: '인프라',
          tone: 'pink',
          current: 2,
          total: 3,
        },
      ],
      techSuitability: 4,
      domainSuitability: 4,
      growthPotential: 3,
      overallScore: 95,
      deadlineText: '26.01.05.',
      bookmarked: false,
    },
  ];

  return (
    <div className="w-full max-w-[1280px] mx-auto">
      {/* 세그먼트 탭 */}
      <div className="flex justify-center">
        <ProjectDeveloperFilter />
      </div>

      {/* 필터 버튼들 - 나중에 추가 예정 */}
      {/* 프로젝트 카드 리스트 */}
      <div className="mt-6 flex flex-col gap-6">
        {projects.map((project) => (
          <SuggetsedProject key={project.id} {...project} />
        ))}
      </div>
    </div>
  );
};

export default RecommendProjectPage;
