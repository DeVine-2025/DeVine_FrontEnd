import type { Position, ProjectItem, TechStack } from '@t/project/api.types';
import type { BadgeTone } from 'src/shared/types/badge-tone.types';

/** toProjectDetailInfo 등에서 쓰는 폴백용 최소 형태 (mock 제거 후 로컬 정의) */
export type FallbackProjectShape = {
  id: string;
  categoryLabel?: string;
  deadlineLabel?: string;
  title: string;
  location?: string;
  period?: string;
  mode?: string;
  dueLabel?: string;
};

// ── Types ──

export type ProjectDetailInfo = {
  id: string;
  categoryLabel?: string;
  deadlineLabel?: string;
  title: string;
  location?: string;
  period?: string;
  mode?: string;
  dueLabel?: string;
  summary?: string;
  creatorName?: string | null;
  creatorId?: number;
  isOwner?: boolean;
  creatorImage?: string | null;
  imageUrls?: string[];
  roles?: ProjectRoleInfo[];
  bookmarked?: boolean;
  bookmarkId?: number;
  status?: import('@apis/project-detail').ProjectStatus;
};

export type ProjectRoleInfo = {
  key: string;
  label: string;
  tone: BadgeTone;
  current: number;
  total: number;
  techStacks: string[];
};

type RecruitmentLike = {
  position?: Position | string;
  positionName?: string;
  currentCount?: number;
  count?: number;
  techStacks?: TechStack[] | null;
};

// ── Constants ──

export const badgeToneByPosition: Partial<Record<Position, BadgeTone>> = {
  BACKEND: 'green',
  FRONTEND: 'blue',
  INFRA: 'pink',
  DESIGN: 'pink',
  PM: 'blue',
  IOS: 'orange',
  ANDROID: 'orange',
};

export const positionLabelByKey: Partial<Record<Position, string>> = {
  BACKEND: '백엔드',
  FRONTEND: '프론트엔드',
  INFRA: '인프라',
  DESIGN: '디자인',
  PM: 'PM',
  IOS: 'iOS',
  ANDROID: '안드로이드',
};

// ── Mappers ──

export const toProjectDetailInfo = (project: FallbackProjectShape): ProjectDetailInfo => ({
  id: project.id,
  categoryLabel: project.categoryLabel,
  deadlineLabel: project.deadlineLabel,
  title: project.title,
  location: project.location,
  period: project.deadlineLabel,
  mode: project.mode,
  dueLabel: 'dueLabel' in project ? project.dueLabel : undefined,
});

const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

function resolveImageUrl(url: string): string {
  if (!url || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//'))
    return url;
  if (url.startsWith('/') && API_BASE) return `${API_BASE.replace(/\/$/, '')}${url}`;
  return url;
}

function getProjectImageUrls(project: ProjectItem): string[] {
  let raw: string[] = [];
  if (Array.isArray(project.imageUrls) && project.imageUrls.length > 0) {
    raw = project.imageUrls.filter((u): u is string => typeof u === 'string' && u.length > 0);
  } else if (Array.isArray(project.images) && project.images.length > 0) {
    raw = project.images
      .map((img) => img?.imageUrl ?? img?.url)
      .filter((u): u is string => typeof u === 'string' && u.length > 0);
  } else if (project.thumbnailUrl && typeof project.thumbnailUrl === 'string') {
    raw = [project.thumbnailUrl];
  }
  return raw.map(resolveImageUrl);
}

export const toProjectDetailInfoFromApi = (project: ProjectItem): ProjectDetailInfo => {
  const summary =
    'content' in project && typeof project.content === 'string' ? project.content : undefined;
  const imageUrls = getProjectImageUrls(project);
  const recruitments =
    'recruitments' in project && Array.isArray(project.recruitments)
      ? (project.recruitments as RecruitmentLike[])
      : (project.positions ?? []);
  const isOwner =
    'isOwner' in project
      ? Boolean((project as ProjectItem & { isOwner?: boolean }).isOwner)
      : undefined;

  return {
    id: String(project.projectId),
    categoryLabel: project.projectFieldName,
    deadlineLabel: project.categoryName,
    title: project.title,
    location: project.location,
    period: project.durationRangeName ?? undefined,
    mode: project.modeName,
    dueLabel: project.recruitmentDeadline,
    bookmarked: project.bookmarked,
    bookmarkId: project.bookmarkId,
    status: (project.status as import('@apis/project-detail').ProjectStatus) ?? undefined,
    summary,
    creatorName: project.creatorNickname ?? project.creatorName,
    creatorId: project.creatorId,
    isOwner,
    creatorImage: project.creatorImage ?? null,
    imageUrls,
    roles: recruitments.map((recruitment) => {
      const positionKey = recruitment.position as Position;
      const label =
        (typeof recruitment.positionName === 'string' && recruitment.positionName) ||
        positionLabelByKey[positionKey] ||
        (typeof recruitment.position === 'string' ? recruitment.position : '포지션');
      return {
        key: typeof recruitment.position === 'string' ? recruitment.position : String(positionKey),
        label,
        tone: badgeToneByPosition[positionKey] ?? 'blue',
        current: recruitment.currentCount ?? 0,
        total: recruitment.count ?? 0,
        techStacks: Array.isArray(recruitment.techStacks)
          ? recruitment.techStacks
              .map(
                (stack) =>
                  stack.techStackName ?? (stack as TechStack & { techStack?: string }).techStack,
              )
              .filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
          : [],
      };
    }),
  };
};
