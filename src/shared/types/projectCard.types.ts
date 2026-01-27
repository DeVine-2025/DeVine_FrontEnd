import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeTone = 'blue' | 'green' | 'pink' | 'orange';

export type TechStackItem = {
  id: string;
  icon?: ReactNode;
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
  period?: string;
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
