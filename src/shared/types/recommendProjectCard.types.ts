import type { ReactNode } from 'react';

export type RecommendBadgeTone = 'blue' | 'green' | 'pink' | 'orange';

export type RecommendTechStackItem = {
  id: string;
  icon?: ReactNode;
  /** icon이 없을 때 getTechBadgeByName(name)으로 아이콘 해석 */
  name?: string;
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
  /** 메모/안정 콜백용 */
  projectId?: string;
  bookmarkId?: number;
  onBookmarkChangeById?: (projectId: string, next: boolean, bookmarkId?: number) => void;

  className?: string;
  onClick?: () => void;
  /** 메모 최적화: 부모에서 stable callback + projectId 전달 시 사용 */
  onNavigateToProject?: (projectId: string) => void;
};

export type RecommendProjectSuitability = {
  /** 기술스택 매칭 (%) - API techstackScorePercent */
  techstackScorePercent?: number | null;
  /** 리포트 유사도 (%) - API similarityScorePercent */
  similarityScorePercent?: number | null;
  /** 도메인 일치 여부 - API domainMatch */
  domainMatch?: boolean | null;
  /** 종합 점수 - API totalScore */
  totalScore?: number | null;
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

