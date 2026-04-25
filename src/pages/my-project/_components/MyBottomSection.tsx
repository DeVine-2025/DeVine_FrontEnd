import { projectQueries } from '@apis/project/project-queries';
import MainProjectCard from '@components/common/MainProjectCard';
import Tabs from '../../../shared/components/tab/CommonTabs';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

function resolveThumbnailUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  const u = url.trim();
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('//')) return u;
  if (u.startsWith('/') && API_BASE) return `${API_BASE.replace(/\/$/, '')}${u}`;
  return u;
}

function getProjectThumbnailUrl(project: {
  thumbnailUrl?: string | null;
  imageUrls?: string[];
  images?: Array<{ imageUrl?: string; url?: string }>;
}): string | undefined {
  const raw =
    project.thumbnailUrl ??
    project.imageUrls?.[0] ??
    project.images?.[0]?.imageUrl ??
    project.images?.[0]?.url;
  return resolveThumbnailUrl(raw);
}

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
    const raw = data?.result ?? data;
    const projects = (() => {
      if (Array.isArray(raw)) return raw;
      if (!raw || typeof raw !== 'object') return [];
      const r = raw as Record<string, unknown>;
      if (Array.isArray(r.content)) return r.content;
      if (Array.isArray(r.projects)) return r.projects;
      const proj = r.projects as Record<string, unknown> | undefined;
      if (proj && Array.isArray(proj.content)) return proj.content;
      return [];
    })();
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
              key={project.projectId ?? project.id}
              categoryLabel={project.projectFieldName ?? project.projectField}
              deadlineLabel={project.categoryName ?? project.category?.name}
              title={project.title}
              location={project.location}
              durationRangeName={project.durationRangeName ?? project.durationRange}
              mode={project.modeName ?? project.mode}
              thumbnailUrl={getProjectThumbnailUrl(project)}
              onClick={() => handleProjectClick(project.projectId ?? project.id)}
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
