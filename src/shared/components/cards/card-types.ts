import type { Domain } from '@constants/domain';

export type ProjectStatus = 'recruiting' | 'inProgress' | 'completed';

export type ProjectCardData = {
  id: string;
  title: string;
  thumbnail: string;
  domain: Domain | null;
  memberCount: { current: number; total: number };
  deadline: { remaining: number | null; date: string };
  status: ProjectStatus | null;
  description: string;
  techStacks: string[];
  duration: string;
  workMode: string;
};
