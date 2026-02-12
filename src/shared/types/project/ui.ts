import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeTone = 'blue' | 'green' | 'pink' | 'orange';

export const EMPTY_MESSAGE = '선택하신 조건에 맞는 프로젝트가 없습니다.';
export const ERROR_MESSAGE =
  '프로젝트를 불러오는 중 문제가 발생했어요.\n잠시 후 다시 시도해 주세요.';

export type TechStackItem = {
  id: string;
  icon?: ReactNode;
};

export type RecommendPreviewItem = {
  id: string;
  categoryLabel: string;
  deadlineLabel: string;
  title: string;
  location: string;
  durationRangeName: string;
  mode: string;
  roles: ProjectRole[];
};

export type ProjectRole = {
  key: string;
  label: string;
  tone: BadgeTone;
  current: number;
  total: number;
  techStack?: readonly TechStackItem[];
};

export type ProjectCardProps = {
  categoryLabel?: string;
  deadlineLabel?: string;

  thumbnailUrl?: string;
  thumbnailAlt?: string;

  title: string;
  location?: string;
  durationRangeName?: string;
  mode?: string;

  roles?: ProjectRole[];

  dueLabel?: string;

  bookmarked?: boolean;
  onBookmarkChange?: (next: boolean) => void;

  className?: string;
  onClick?: () => void;
};

export type ProjectCardBaseParts = {
  metaText: string;

  Thumbnail: ReactNode;
  HeaderBadges: ReactNode;
  Title: ReactNode;
  Meta: ReactNode;

  RolesLg: ReactNode;
  RolesMd: ReactNode;

  Due: ReactNode;
  Bookmark: ReactNode;

  CardActionProps: HTMLAttributes<HTMLElement>;
};

export type ProjectCardBaseProps = ProjectCardProps & {
  render: (parts: ProjectCardBaseParts) => ReactNode;
};
