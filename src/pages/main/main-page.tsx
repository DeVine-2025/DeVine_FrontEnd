import { Link } from 'react-router-dom';
import { PROFILE_CARD_LIST } from 'src/mocks/developer.mock';
import { PROJECT_LIST, PROJECT_ROLES, RECOMMENDED_PROJECTS } from 'src/mocks/project.mock';
import MainProfileCard from './components/MainProfileCard';
import MainProjectCard from './components/MainProjectCard';
import MainProjectLg from './components/MainProjectLg';

const USER_ROLE_KEY = 'userRole';

const MainPage = () => {
  const userRole = localStorage.getItem(USER_ROLE_KEY) as 'pm' | 'dev' | null;
  const isLoggedIn = userRole === 'pm' || userRole === 'dev';
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
                  <MainProfileCard
                    key={profile.id}
                    {...profile}
                    matchReason="의 Java/Springboot 요구사항과 일치합니다."
                  />
                ))
              : recommendedProjects.map((project) => (
                  <MainProjectLg
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
                  />
                ))}
          </div>

          {!isLoggedIn && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex w-full max-w-[420px] flex-col items-center gap-4 rounded-3xl bg-[var(--ui-bg)] px-8 py-6 text-center shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
                <div className="flex flex-col gap-2">
                  <span className="Body1 font-semibold text-card-title">로그인이 필요해요</span>
                  <span className="Caption1 text-card-muted">
                    로그인하면 추천 프로젝트를 확인할 수 있어요
                  </span>
                </div>
                <Link
                  to="/login"
                  className="Body1 inline-flex h-[40px] items-center justify-center rounded-xl bg-[var(--badge-text-primary)] px-6 font-semibold text-white"
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
