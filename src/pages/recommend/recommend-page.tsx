import ProfileCard from '@components/common/ProfileCard';
import ProjectCard from '@components/common/ProjectCard';

const RecommendPage = () => {
  // Mock data for demonstration
  const recommendedProjects = [
    {
      id: '1',
      title: 'AI 기반 스마트 홈 시스템',
      subtitle: 'IoT 플랫폼 개발',
      location: '서울',
      period: '3개월',
      mode: '원격',
      categoryLabel: '웹 개발',
      deadlineLabel: '마감 임박',
      roles: [
        {
          key: 'frontend',
          label: '프론트엔드 개발자',
          tone: 'blue' as const,
          current: 2,
          total: 3,
          techStack: [
            { id: 'react', name: 'React' },
            { id: 'typescript', name: 'TypeScript' },
          ],
        },
      ],
      bookmarked: false,
    },
    {
      id: '2',
      title: '모바일 앱 UI/UX 디자인',
      location: '부산',
      period: '2개월',
      mode: '상주',
      categoryLabel: '디자인',
      roles: [
        {
          key: 'designer',
          label: 'UI/UX 디자이너',
          tone: 'pink' as const,
          current: 1,
          total: 2,
        },
      ],
      bookmarked: true,
    },
  ];

  const recommendedDevelopers = [
    {
      id: '1',
      name: '김개발',
      role: '프론트엔드 개발자',
      skills: ['React', 'TypeScript', 'Next.js'],
      experience: '3년',
      location: '서울',
      available: true,
    },
    {
      id: '2',
      name: '이디자인',
      role: 'UI/UX 디자이너',
      skills: ['Figma', 'Sketch', 'Adobe XD'],
      experience: '4년',
      location: '부산',
      available: false,
    },
  ];

  const handleBookmarkChange = (bookmarked: boolean, id?: string) => {
    console.log('Bookmark changed:', bookmarked, id);
  };

  return (
    <div className="min-h-screen bg-[var(--ui-bg)]">
      <div className="mx-auto max-w-[144rem] px-[2rem] py-[4rem]">
        {/* 헤더 */}
        <div className="mb-[4rem] text-center">
          <h1 className="mb-[1rem] font-bold text-4xl text-[var(--ui-900)]">
            추천 프로젝트/개발자
          </h1>
          <p className="text-[var(--ui-600)] text-lg">
            당신의 관심사에 맞는 프로젝트와 개발자를 추천해드립니다
          </p>
        </div>

        {/* 추천 프로젝트 섹션 */}
        <section className="mb-[6rem]">
          <h2 className="mb-[2rem] font-semibold text-2xl text-[var(--ui-900)]">추천 프로젝트</h2>
          <div className="grid gap-[2rem] md:grid-cols-2 lg:grid-cols-1">
            {recommendedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                {...project}
                onBookmarkChange={handleBookmarkChange}
                size="medium"
              />
            ))}
          </div>
        </section>

        {/* 추천 개발자 섹션 */}
        <section>
          <h2 className="mb-[2rem] font-semibold text-2xl text-[var(--ui-900)]">추천 개발자</h2>
          <div className="grid gap-[2rem] md:grid-cols-2 lg:grid-cols-3">
            {recommendedDevelopers.map((developer) => (
              <ProfileCard key={developer.id} {...developer} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RecommendPage;
