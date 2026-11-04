import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProjectListItem } from '@apis/recommend';
import { DOMAIN_OPTIONS, type Domain } from '@constants/domain';
import DefaultImage from '@assets/images/devine-symbol.png';
import HomeRecommendedProjectCard from '@components/cards/HomeRecommendedProjectCard';

import '@components/cards/home-recommended-project-card.css';
import TechStackBadges from '@components/cards/TechStackBadges';
import type { ProjectStatus } from '@components/cards/card-types';
import { recommendationMockSources } from './recommendation-mock-data';

export default function RecommendationProjectCard({ project, saved, onBookmark, variant: _variant }: { project: ProjectListItem; saved: boolean; onBookmark: (next: boolean) => Promise<void>; variant: 'list' | 'grid' }) {
  const previewRef = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const mock = project.id.startsWith('preview-') ? recommendationMockSources.find(item => `preview-${item.id}` === project.id) : undefined;
  const roles = project.roles ?? [];
  const category = project.deadlineLabel || project.categoryLabel;
  const status: ProjectStatus | null = mock?.status ?? (project.daysUntilDeadline == null ? null : project.daysUntilDeadline < 0 ? 'completed' : 'recruiting');
  return <>
    <HomeRecommendedProjectCard recommended project={{ recommendation: { score: project.totalScore ?? 0, reason: mock?.recommendation?.reason ?? (project.domainMatch ? '관심 분야가 일치해요.' : '기술 역량을 바탕으로 추천해요.') }, id: project.id, title: project.title, thumbnail: project.thumbnailUrl || DefaultImage, domain: DOMAIN_OPTIONS.includes(category as Domain) ? category as Domain : null, status, description: mock?.description || [project.mode, project.location, project.period].filter(Boolean).join(' · ') || '프로젝트 상세에서 함께할 팀을 확인해 보세요.', memberCount: { current: roles.reduce((sum, role) => sum + role.current, 0), total: roles.reduce((sum, role) => sum + role.total, 0) }, deadline: { remaining: project.daysUntilDeadline ?? null, date: project.recruitmentDeadline ?? '' }, techStacks: roles.flatMap(role => role.techStack?.map(stack => stack.name).filter((name): name is string => !!name) ?? []), workMode: project.mode, duration: project.period }} saved={saved} onOpen={() => mock ? previewRef.current?.showModal() : navigate(`/project/${project.id}`)} onToggle={() => { void onBookmark(!saved); }} />
    {mock && <dialog ref={previewRef} className="rec-preview-dialog" aria-label={`${project.title} 예시 프로젝트`} onClick={event => { if (event.target === event.currentTarget) previewRef.current?.close(); }}><span className="rec-preview-label">목데이터 미리보기</span><h2>{mock.title}</h2><p>{mock.introduction}</p><TechStackBadges stacks={mock.techStacks} /><p>{mock.recruiting}<br />{mock.workMode} · {mock.duration}</p><button className="rec-primary" onClick={() => previewRef.current?.close()}>닫기</button></dialog>}
  </>;
}
