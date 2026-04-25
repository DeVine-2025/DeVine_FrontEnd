import type { ReactNode } from 'react';
import type { BadgeTone } from './project/ui.types';

export type TechStackItem = {
  id: string;
  name: string;
  icon?: ReactNode;
};

export type ProfileCardProps = {
  role?: string;
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
  header?: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

// Developer type
export type MemberSearchCategory =
  | 'HEALTHCARE'
  | 'FINTECH'
  | 'ECOMMERCE'
  | 'EDUCATION'
  | 'SOCIAL'
  | 'ENTERTAINMENT'
  | 'AI_DATA'
  | 'ETC';

export type GetDevelopersParams = {
  categories?: string[];
  techNames?: string[];
  page?: number;
  size?: number;
};

export type MemberMainType = 'PM' | 'DEVELOPER';

export type MemberSummaryDto = {
  nickname: string;
  address: string | null;
  disclosure: boolean;
  mainType: MemberMainType;
  imageUrl: string | null;
  body: string | null;
  used: string;
  createdAt: string;
};

export type TechStackSource = 'AUTO' | 'MANUAL';

export type TechstackDto = {
  techstackId: number;
  name: string;
  genre: string | null;
  source: TechStackSource;
};

export type DeveloperSearchContentDto = {
  member: MemberSummaryDto;
  domains: string[];
  techstacks: TechstackDto[];
};

export type DeveloperSearchPage = {
  content: DeveloperSearchContentDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type DeveloperSearchResponse = {
  isSuccess: boolean;
  code?: string;
  message?: string;
  result?: DeveloperSearchPage;
};
