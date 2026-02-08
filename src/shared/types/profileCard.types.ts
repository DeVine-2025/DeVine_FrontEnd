import type { ReactNode } from 'react';
import type { BadgeTone } from './project/ui';

export type TechStackItem = {
  id: string;
  name: string;
  icon?: ReactNode;
};

export type ProfileCardProps = {
  role: string;
  roleTone?: BadgeTone;
  nickname: string;
  profileImageUrl: string;
  profileImageAlt?: string;
  id?: string;

  introduction?: string;

  badges?: Array<{ id?: string; label: string; tone: BadgeTone }>;
  techStack?: TechStackItem[];

  bookmarked?: boolean;
  onBookmarkChange?: (next: boolean, id?: string) => void;

  size?: 'sm' | 'md' | 'lg';
  action?: React.ReactNode;
  className?: string;
};
