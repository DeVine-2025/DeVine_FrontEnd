import { projectQueries } from '@apis/project/project-queries';
import MainProjectCard from '@components/common/MainProjectCard';
import Tabs from '@components/tab/CommonTabs';
import ProjectCard from '@components/cards/ProjectCard';
import defaultProjectImage from '@assets/images/devine-symbol.png';
import { DOMAIN_OPTIONS, DOMAIN_REVERSE_MAP } from '@constants/domain';
import type { ProjectItem } from '@t/project/api';
import type { ProjectCardData } from '@components/cards/card-types';
import { useElasticUnderline } from '@hooks/useElasticUnderline';
import { useQuery } from '@tanstack/react-query';
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
  animatedTabs?: boolean;
  sampleProjects?: ProjectCardData[];
};

const projectStatuses: { value: ProjectTab; label: string }[] = [
  { value: 'ongoing', label: '진행 중인 프로젝트' },
  { value: 'recruiting', label: '모집 중인 프로젝트' },
  { value: 'done', label: '완료된 프로젝트' },
];

function AnimatedProjectTabs({ projectTab, onChangeProjectTab }: Pick<Props, 'projectTab' | 'onChangeProjectTab'>) {
  const { navRef, indicatorRef } = useElasticUnderline(projectTab, 'button[aria-pressed=true]');

  return (
    <nav ref={navRef} className="explore-tabs my-project-status-tabs" aria-label="프로젝트 상태">
      {projectStatuses.map(({ value, label }) => (
        <button key={value} type="button" aria-pressed={projectTab === value} onClick={() => onChangeProjectTab(value)}>
          {label}
        </button>
      ))}
      <span ref={indicatorRef} className="explore-tabs-indicator" aria-hidden="true" />
    </nav>
  );
}

type StatusProject = Partial<ProjectItem> & { id?: number; title: string };

function toListCard(project: StatusProject, status: ProjectCardData['status']): ProjectCardData {
  const positions = project.positions ?? project.recruitments ?? [];
  const category = project.category ? DOMAIN_REVERSE_MAP[project.category] ?? project.categoryName : project.categoryName;
  return {
    id: String(project.projectId ?? project.id),
    title: project.title,
    thumbnail: getProjectThumbnailUrl(project) ?? defaultProjectImage,
    domain: DOMAIN_OPTIONS.find(option => option === category) ?? null,
    memberCount: {
      current: positions.reduce((total, position) => total + (position.currentCount ?? 0), 0),
      total: positions.reduce((total, position) => total + (position.count ?? 0), 0),
    },
    deadline: {
      remaining: typeof project.daysUntilDeadline === 'number' ? project.daysUntilDeadline : null,
      date: project.recruitmentDeadline ?? '',
    },
    status,
    description: project.content?.replace(/<[^>]*>/g, '').trim() ?? '',
    techStacks: [...new Set(positions.flatMap(position =>
      (position.techStacks ?? []).map(stack => stack.techStackName ?? stack.techStack ?? '').filter(Boolean),
    ))],
    duration: project.durationRangeName ?? '',
    workMode: project.modeName ?? '',
  };
}

const statusByTab = { ongoing: 'inProgress', recruiting: 'recruiting', done: 'completed' } as const;

const MyBottomSection = ({ projectTab, onChangeProjectTab, memberNick, animatedTabs = false, sampleProjects = [] }: Props) => {
  const navigate = useNavigate();

  const useMemberProjects = Boolean(memberNick);
  const ongoing = useQuery(
    useMemberProjects
      ? projectQueries.getMemberProjectInprogress(memberNick!)
      : projectQueries.getMYProjectInprogress()
  );
  const recruiting = useQuery(
    useMemberProjects
      ? projectQueries.getMemberProjectRecruiting(memberNick!)
      : projectQueries.getMYProjectRecruiting()
  );
  const done = useQuery(
    useMemberProjects
      ? projectQueries.getMemberProjectCompleted(memberNick!)
      : projectQueries.getMYProjectCompleted()
  );

  const queries = { ongoing, recruiting, done };
  const { data, isPending, isError } = queries[projectTab];
  const statusLabel = projectStatuses.find(status => status.value === projectTab)?.label;
  const raw = data?.result ?? data;
  const projects = (() => {
    if (Array.isArray(raw)) return raw;
    if (!raw || typeof raw !== 'object') return [];
    const result = raw as Record<string, unknown>;
    if (Array.isArray(result.content)) return result.content;
    if (Array.isArray(result.projects)) return result.projects;
    const nested = result.projects as Record<string, unknown> | undefined;
    return Array.isArray(nested?.content) ? nested.content : [];
  })();

  return (
    <section>
      {animatedTabs ? (
        <AnimatedProjectTabs projectTab={projectTab} onChangeProjectTab={onChangeProjectTab} />
      ) : (
        <div className="flex items-center justify-between">
          <Tabs<ProjectTab> value={projectTab} onChange={onChangeProjectTab} items={projectStatuses} />
        </div>
      )}
      <div className={animatedTabs ? 'mt-6 grid gap-[1.6rem]' : 'mt-6 grid grid-cols-1 gap-[1.6rem] sm:grid-cols-2 lg:grid-cols-3'}>
        {projects.map(project => animatedTabs ? (
          <ProjectCard
            key={project.projectId ?? project.id}
            project={toListCard(project, statusByTab[projectTab])}
            variant="list"
            openLabel={project.title + ' 프로젝트 상세 보기'}
            onOpen={() => navigate('/project/' + (project.projectId ?? project.id))}
          />
        ) : (
          <MainProjectCard
            key={project.projectId ?? project.id}
            categoryLabel={project.projectFieldName ?? project.projectField}
            deadlineLabel={project.categoryName ?? project.category?.name}
            title={project.title}
            location={project.location}
            durationRangeName={project.durationRangeName ?? project.durationRange}
            mode={project.modeName ?? project.mode}
            thumbnailUrl={getProjectThumbnailUrl(project)}
            onClick={() => navigate('/project/' + (project.projectId ?? project.id))}
          />
        ))}
        {sampleProjects.map(project => (
          <ProjectCard key={'sample-' + project.id} project={project} variant="list" />
        ))}
        {(isError || (projects.length === 0 && sampleProjects.length === 0)) && (
          <div className="col-span-full flex items-center justify-center py-8">
            <p className="text-lg text-ui-400">
              {isPending ? '프로젝트를 불러오는 중이에요.' : isError ? '프로젝트를 불러오지 못했어요.' : (statusLabel ?? '프로젝트') + '가 없습니다.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyBottomSection;
