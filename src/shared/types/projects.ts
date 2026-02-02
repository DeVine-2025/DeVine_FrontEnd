export type ProjectField = 'WEB' | 'MOBILE' | 'AI' | 'GAME' | 'DATA' | 'BACKEND' | 'FRONTEND';
export type Position = 'BACKEND' | 'FRONTEND' | 'DESIGN' | 'PM' | 'IOS' | 'ANDROID';
export type Mode = 'ONLINE' | 'OFFLINE' | 'BOTH';
export type DurationRange = 'UNDER_ONE' | 'ONE_TO_THREE' | 'THREE_TO_SIX' | 'SIX_PLUS';

export type TechStack = {
  techStackId: number;
  techStackName: string;
};

export type ProjectPosition = {
  position: Position;
  positionName: string;
  count: number;
  currentCount: number;
  techStacks: TechStack[];
};

export type ProjectItem = {
  projectId: number;
  title: string;
  projectField: ProjectField;
  projectFieldName: string;
  categoryName: string;
  mode: Mode;
  modeName: string;
  durationMonths: number;
  location: string;
  recruitmentDeadline: string;
  daysUntilDeadline: number;
  status: 'RECRUITING' | 'CLOSED' | string;
  thumbnailUrl: string | null;
  positions: ProjectPosition[];
  creatorName: string;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type GetProjectsResponse = {
  projects: PageResponse<ProjectItem>;
};
