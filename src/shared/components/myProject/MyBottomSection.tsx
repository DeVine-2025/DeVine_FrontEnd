import { projectQueries } from '@apis/project/project-queries';
import MainProjectCard from '@components/common/MainProjectCard';
import Tabs from '@components/tab/CommonTabs';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export type ProjectTab = 'ongoing' | 'recruiting' | 'done';

type Props = {
  projectTab: ProjectTab;
  onChangeProjectTab: (tab: ProjectTab) => void;
  memberNick?: string;
};

const MyBottomSection = ({ projectTab, onChangeProjectTab, memberNick }: Props) => {
  const navigate = useNavigate();

  const useMemberProjects = Boolean(memberNick);
  const { data: inProgressData } = useQuery(
    useMemberProjects
      ? projectQueries.getMemberProjectInprogress(memberNick!)
      : projectQueries.getMYProjectInprogress()
  );
  const { data: recruitingData } = useQuery(
    useMemberProjects
      ? projectQueries.getMemberProjectRecruiting(memberNick!)
      : projectQueries.getMYProjectRecruiting()
  );
  const { data: completedData } = useQuery(
    useMemberProjects
      ? projectQueries.getMemberProjectCompleted(memberNick!)
      : projectQueries.getMYProjectCompleted()
  );

  const currentProjects = useMemo(() => {
    let data;
    if (projectTab === 'ongoing') {
      data = inProgressData;
    } else if (projectTab === 'recruiting') {
      data = recruitingData;
    } else {
      data = completedData;
    }
    const projects = data?.result?.projects?.content || [];
    return projects;
  }, [projectTab, inProgressData, recruitingData, completedData]);

  const handleProjectClick = (projectId: number) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <section>
      <div className="flex items-center justify-between">
        <Tabs<ProjectTab>
          value={projectTab}
          onChange={onChangeProjectTab}
          items={[
            { value: 'ongoing', label: '진행 중인 프로젝트' },
            { value: 'recruiting', label: '모집중인 프로젝트' },
            { value: 'done', label: '완료된 프로젝트' },
          ]}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-[1.6rem] sm:grid-cols-2 lg:grid-cols-3">
        {currentProjects.length > 0 ? (
          currentProjects.map((project: any) => (
            <MainProjectCard
              key={project.projectId}
              categoryLabel={project.projectField}
              deadlineLabel={project.category?.name}
              title={project.title}
              location={project.location}
              showBookmark={false}
              durationRangeName={project.durationRange}
              mode={project.mode}
              thumbnailUrl={project.imageUrls?.[0]}
              onClick={() => handleProjectClick(project.projectId)}
            />
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center py-12">
            <p className="text-lg text-ui-400">
              {projectTab === 'ongoing'
                ? '진행 중인 프로젝트가 없습니다.'
                : projectTab === 'recruiting'
                ? '모집중인 프로젝트가 없습니다.'
                : '완료된 프로젝트가 없습니다.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyBottomSection;
