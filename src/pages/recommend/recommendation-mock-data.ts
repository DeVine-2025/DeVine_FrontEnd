import type { ProjectListItem } from '@apis/recommend';
import type { RecommendDeveloperListItem } from '@apis/members';
import { featuredProjects, recentProjects, recommendedProjects, recommendedDevelopers } from '../home/home-mock-data';

export const recommendationMockSources = [...new Map([...recommendedProjects, ...featuredProjects, ...recentProjects].map(project => [project.id, project])).values()];

export const recommendationMockDeveloperProjects = recommendationMockSources.filter(project => project.status !== 'completed').map((project, index) => ({ projectId: -(index + 1), title: project.title }));

export const recommendationMockDevelopers: RecommendDeveloperListItem[] = recommendedDevelopers.filter(developer => developer.role !== 'Product Designer').map(developer => ({
  id: `preview-${developer.id}`,
  nickname: developer.name,
  role: ({ 'Fullstack Developer': '풀스택', 'Frontend Developer': '프론트엔드', 'Backend Developer': '백엔드' } as Record<string, string>)[developer.role] ?? developer.role,
  roleTone: 'blue',
  introduction: developer.introduction,
  techStack: developer.skills.map(name => ({ id: name, name })),
}));

// Preview data only. String IDs must never be sent to the project/bookmark API.
export const recommendationMockProjects: ProjectListItem[] = recommendationMockSources.map((project, index) => ({
  id: `preview-${project.id}`,
  title: project.title,
  categoryLabel: project.tags[0] ?? '',
  deadlineLabel: project.domain,
  location: '',
  period: project.duration,
  mode: project.workMode,
  dueLabel: `D-${project.deadline.remaining}`,
  status: project.status,
  daysUntilDeadline: project.status === 'completed' ? -1 : project.deadline.remaining,
  recruitmentDeadline: `2026-${project.deadline.date.replace('.', '-')}`,
  totalScore: project.recommendation?.score ?? Math.max(76, 94 - index * 2),
  techstackScorePercent: Math.max(72, 96 - index * 3),
  similarityScorePercent: Math.max(70, 92 - index * 2),
  domainMatch: index % 3 !== 2,
  roles: [{ key: 'DEVELOPER', label: '개발자', tone: 'blue', current: project.memberCount.current, total: project.memberCount.total, techStack: project.techStacks.map(name => ({ id: name, name })) }],
}));
