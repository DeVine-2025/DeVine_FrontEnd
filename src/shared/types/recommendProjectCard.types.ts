import type { ReactNode } from 'react';

export type RecommendBadgeTone = 'blue' | 'green' | 'pink' | 'orange';

export type RecommendTechStackItem = {
  id: string;
  icon?: ReactNode;
};

export type RecommendProjectRole = {
  key: string;
  label: string;
  tone: RecommendBadgeTone;
  current: number;
  total: number;
  techStack?: readonly RecommendTechStackItem[];
};

export type RecommendProjectCardCoreProps = {
  categoryLabel?: string;
  deadlineLabel?: string;

  thumbnailUrl?: string;
  thumbnailAlt?: string;

  title: string;
  location?: string;
  period?: string;
  mode?: string;

  roles?: RecommendProjectRole[];

  dueLabel?: string;

  bookmarked?: boolean;
  onBookmarkChange?: (next: boolean) => void;

  className?: string;
  onClick?: () => void;
};

export type RecommendProjectSuitability = {
  techSuitability?: number;
  domainSuitability?: number;
  growthPotential?: number;
  overallScore?: number;
};

export type RecommendProjectCardProps = RecommendProjectCardCoreProps & RecommendProjectSuitability;

export type RecommendProjectCardBaseParts = {
  metaText: string;

  Thumbnail: ReactNode;
  HeaderBadges: ReactNode;
  Title: ReactNode;
  Meta: ReactNode;

  RolesLg: ReactNode;
  RolesMd: ReactNode;

  Due: ReactNode;
  Bookmark: ReactNode;
};

export type RecommendProjectCardBaseProps = RecommendProjectCardCoreProps & {
  render: (parts: RecommendProjectCardBaseParts) => ReactNode;
};

