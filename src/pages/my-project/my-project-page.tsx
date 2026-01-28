import ProfileCard from '@components/common/ProfileCard';
import MainProjectCard from '@pages/main/components/MainProjectCard';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROFILE_CARD_LIST } from 'src/mocks/developer.mock';
import { PROJECT_ROLES, RECOMMENDED_PROJECTS } from 'src/mocks/project.mock';

type DevTab = 'suggested' | 'applied';
type ProjectTab = 'ongoing' | 'done';

const MyProjectPage = () => {
  const [devTab, setDevTab] = useState<DevTab>('suggested');
  const [projectTab, setProjectTab] = useState<ProjectTab>('ongoing');

  const highlightProjects = RECOMMENDED_PROJECTS.slice(0, 4);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1180px] pb-20">
        <h1 className="Heading2 pt-5 font-semibold text-card-title">내 프로젝트</h1>

        {/* ===== 상단 ===== */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <Tabs<DevTab>
              value={devTab}
              onChange={setDevTab}
              items={[
                { value: 'suggested', label: '제안한 개발자' },
                { value: 'applied', label: '개발자 지원 현황' },
              ]}
            />

            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex cursor-pointer items-center gap-2 text-card-muted text-xl hover:opacity-80"
            >
              더보기 <span aria-hidden="true">›</span>
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {PROFILE_CARD_LIST.map((profile) => (
              <ProfileCard
                key={profile.id}
                {...profile}
                size="lg"
                action={
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="cursor-pointer rounded-xl bg-[#4E49FF] px-3 py-2 font-medium text-[12px] text-my-tab-inactive"
                      onClick={() => console.log('수락', profile.id)}
                    >
                      수락하기
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer rounded-xl bg-surface-tab px-3 py-2 font-medium text-[12px] text-my-tab-text"
                      onClick={() => console.log('거절', profile.id)}
                    >
                      거절하기
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        </section>

        {/* 구분선 */}
        <div className="-translate-x-1/2 relative right-1/2 left-1/2 my-15 h-[15px] w-screen bg-profile-card-bg" />

        {/* ===== 하단 ===== */}
        <section>
          <div className="flex items-center justify-between">
            <Tabs<ProjectTab>
              value={projectTab}
              onChange={setProjectTab}
              items={[
                { value: 'ongoing', label: '진행 중인 프로젝트' },
                { value: 'done', label: '완료된 프로젝트' },
              ]}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>
    </div>
  );
};

export default MyProjectPage;

/** ---------- local UI components ---------- */
function Tabs<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: string }[];
}) {
  return (
    <div className="flex gap-4">
      {items.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={[
              'rounded-full border px-6 py-2.5 font-medium text-[13px] transition',
              active
                ? 'bg-my-tab-active text-tab-bg-active'
                : 'border-my-tab-border bg-my-tab-inactive text-my-tab-text',
            ].join(' ')}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
