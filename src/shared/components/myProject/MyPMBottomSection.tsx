import Tabs from '@components/tab/CommonTabs';
import MainProjectCard from '@pages/main/components/MainProjectCard';
import { useMemo } from 'react';
import { PROJECT_ROLES, RECOMMENDED_PROJECTS } from 'src/mocks/project.mock';

export type ProjectTab = 'ongoing' | 'done';

type Props = {
  projectTab: ProjectTab;
  onChangeProjectTab: (tab: ProjectTab) => void;
};

const MyPMBottomSection = ({ projectTab, onChangeProjectTab }: Props) => {
  const highlightProjects = useMemo(() => RECOMMENDED_PROJECTS.slice(0, 4), []);

  return (
    <section>
      <div className="flex items-center justify-between">
        <Tabs<ProjectTab>
          value={projectTab}
          onChange={onChangeProjectTab}
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
  );
};

export default MyPMBottomSection;
