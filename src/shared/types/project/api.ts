export type ProjectField =
  | 'WEB'
  | 'MOBILE'
  | 'AI'
  | 'GAME'
  | 'DATA'
  | 'BACKEND'
  | 'FRONTEND'
  | 'BLOCKCHAIN'
  | 'ETC';
export type Category =
  | 'HEALTHCARE'
  | 'FINTECH'
  | 'ECOMMERCE'
  | 'EDUCATION'
  | 'SOCIAL'
  | 'ENTERTAINMENT'
  | 'AI_DATA'
  | 'ETC';
export type Position = 'BACKEND' | 'FRONTEND' | 'INFRA' | 'DESIGN' | 'PM' | 'IOS' | 'ANDROID';
export type Mode = 'ONLINE' | 'OFFLINE' | 'HYBRID';
export type DurationRange = 'UNDER_ONE' | 'ONE_TO_THREE' | 'THREE_TO_SIX' | 'SIX_PLUS';

export type TechStack = {
  techStackId: number;
  techStackName?: string;
  techStack?: string;
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
  category?: Category;
  categoryName: string;
  mode: Mode;
  modeName: string;
  durationMonths: number;
  durationRange?: DurationRange;
  durationRangeName?: string;
  location: string;
  recruitmentDeadline: string;
  daysUntilDeadline: number;
  content?: string;
  status: 'RECRUITING' | 'CLOSED' | string;
  creatorId?: number;
  thumbnailUrl: string | null;
  imageUrls?: string[];
  images?: Array<{ imageId?: number; imageUrl?: string; url?: string }>;
  positions?: ProjectPosition[];
  recruitments?: ProjectPosition[];
  creatorName: string | null;
  creatorNickname?: string | null;
  creatorImage?: string | null;
  /** 프로젝트 상세 — 작성자 Clerk ID (채팅방 생성용) */
  creatorClerkId?: string | null;
  bookmarked?: boolean;
  bookmarkId?: number;
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

export type GetProjectsParams = {
  projectField?: ProjectField;
  category?: string;
  position?: Position;
  techstackName?: string;
  durationRange?: DurationRange;
  page?: number;
  size?: number;
};

export type AppliedFilters = {
  projectTypes: string[];
  domains: string[];
  expectedPeriods: string[];
  techStacks: string[];
};
