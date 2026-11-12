import { useNavigate } from 'react-router-dom';
import type { ProjectListItem } from '@apis/recommend';
import { DOMAIN_OPTIONS, type Domain } from '@constants/domain';
import DefaultImage from '@assets/images/devine-symbol.png';
import RecommendedProjectCard from '@components/cards/RecommendedProjectCard';

import '@components/cards/home-recommended-project-card.css';
import type { ProjectStatus } from '@components/cards/card-types';
import { recommendationMockSources } from './recommendation-mock-data';

export default function RecommendedProjectApiCard({ project, saved, onBookmark, variant: _variant }: { project: ProjectListItem; saved: boolean; onBookmark: (next: boolean) => Promise<void>; variant: 'list' | 'grid' }) {
  const navigate = useNavigate();
  const mock = project.id.startsWith('preview-') ? recommendationMockSources.find(item => `preview-${item.id}` === project.id) : undefined;
  const roles = project.roles ?? [];
  const category = project.deadlineLabel || project.categoryLabel;
  const status: ProjectStatus | null = mock?.status ?? null;
  return <>
    <RecommendedProjectCard recommended project={{ recommendation: project.totalScore == null ? undefined : { score: project.totalScore, reason: mock?.recommendation?.reason ?? (project.domainMatch ? '관심 분야가 일치해요.' : '나에게 추천하는 프로젝트예요.') }, id: project.id, title: project.title, thumbnail: project.thumbnailUrl || DefaultImage, domain: DOMAIN_OPTIONS.includes(category as Domain) ? category as Domain : null, status, description: mock?.description || [project.mode, project.location, project.period].filter(Boolean).join(' · '), memberCount: { current: roles.reduce((sum, role) => sum + role.current, 0), total: roles.reduce((sum, role) => sum + role.total, 0) }, deadline: { remaining: project.daysUntilDeadline ?? null, date: project.recruitmentDeadline ?? '' }, techStacks: roles.flatMap(role => role.techStack?.map(stack => stack.name).filter((name): name is string => !!name) ?? []), workMode: project.mode, duration: project.period }} saved={saved} onOpen={() => navigate(`/project/${mock ? `sample-${mock.id}` : project.id}`)} onToggle={() => { void onBookmark(!saved); }} />
  </>;
}
