import { useAuth } from '@clerk/clerk-react';
import MainProjectCard from '@components/common/MainProjectCard';
import RecommendDeveloperCard from '@components/common/RecommendDeveloperCard';
import RecommendProjectCard from '@components/common/RecommendProjectCard';
import { Link } from 'react-router-dom';
import { PROFILE_CARD_LIST } from 'src/mocks/developer.mock';
import { PROJECT_LIST, PROJECT_ROLES, RECOMMENDED_PROJECTS } from 'src/mocks/project.mock';

const USER_ROLE_KEY = 'userRole';

const MainPage = () => {
  const { isSignedIn } = useAuth();
  const userRole = localStorage.getItem(USER_ROLE_KEY) as 'pm' | 'dev' | null;
  const isLoggedIn = Boolean(isSignedIn);
  const isPm = userRole === 'pm';

  const highlightProjects = RECOMMENDED_PROJECTS.slice(0, 4);
  const recommendedProfiles = PROFILE_CARD_LIST.slice(0, 3);
  const recommendedProjects = PROJECT_LIST.slice(0, 3);

  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-14">
      <section className="flex flex-col gap-6">
        <h2 className="Heading2 pt-5 font-semibold text-card-title">
          이번주 모두가 주목하는 프로젝트
        </h2>
        <div className="scrollbar-hide flex gap-6 overflow-x-auto">
          {highlightProjects.map((project) => (
            <MainProjectCard
              key={project.id}
              categoryLabel={project.categoryLabel}
              deadlineLabel={project.deadlineLabel}
              title={project.title}
              location={project.location}
              period={project.period}
              mode={project.mode}
              roles={[...PROJECT_ROLES]}
              bookmarked={project.bookmarked}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="Heading2 font-semibold text-card-title">
          나에게 딱 맞는 추천 프로젝트/개발자
        </h2>
        <div className="relative">
          <div
            className={`flex flex-col gap-6 ${
              isLoggedIn ? '' : 'pointer-events-none select-none blur-sm'
            }`}
          >
            {isPm
              ? recommendedProfiles.map((profile) => (
                  <RecommendDeveloperCard
                    key={profile.id}
                    role={profile.role}
                    roleTone={profile.roleTone}
                    nickname={profile.nickname}
                    profileImageUrl={profile.profileImageUrl}
                    introduction={profile.introduction}
                    domains={profile.badges?.map((badge) => ({ label: badge.label }))}
                    techStack={profile.techStack}
                    bookmarked={profile.bookmarked}
                    matchedReason="의 Java/Springboot 요구사항과 일치합니다."
                  />
                ))
              : recommendedProjects.map((project) => (
                  <RecommendProjectCard
                    key={project.id}
                    categoryLabel={project.categoryLabel}
                    deadlineLabel={project.deadlineLabel}
                    title={project.title}
                    location={project.location}
                    period={project.period}
                    mode={project.mode}
                    roles={[...PROJECT_ROLES]}
                    dueLabel={project.dueLabel}
                    bookmarked={project.bookmarked}
                    techSuitability={project.techSuitability}
                    domainSuitability={project.domainSuitability}
                    growthPotential={project.growthPotential}
                    overallScore={project.overallScore}
                  />
                ))}
          </div>

          {!isLoggedIn && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-[210px] w-[400px] flex-col items-start gap-7 rounded-2xl border border-[#41444D] bg-[#212328] p-11 text-left shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
                <div className="flex flex-col gap-2">
                  <span className="text-[21px] font-semibold text-card-title">로그인이 필요해요</span>
                  <span className="text-[15px] text-[#F8F9FB]">
                    로그인하면 추천 프로젝트를 확인할 수 있어요
                  </span>
                </div>
                <Link
                  to="/login"
                  className="inline-flex h-[52px] w-full items-center justify-center rounded-2xl bg-[#4E49FF] font-semibold text-white text-[18px]"
                >
                  로그인하기
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </section>
  );
};

export default MainPage;
