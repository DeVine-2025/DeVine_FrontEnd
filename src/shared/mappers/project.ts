import type { ProjectItem } from '@t/project/api';
import type { ProjectRole } from '@t/project/ui';

// 포지션 코드 (역할 배지에 사용하는 색상 반환)
export function getRoleTone(position: string): ProjectRole['tone'] {
  switch (position) {
    case 'BACKEND':
      return 'green';
    case 'FRONTEND':
      return 'blue';
    case 'INFRA':
      return 'pink';
    case 'DESIGN':
      return 'orange';
    default:
      return 'pink';
  }
}

// 프로젝트 카드 UI
export type ProjectCardModel = {
  id: number;
  title: string;
  categoryLabel: string;
  deadlineLabel: string;
  location: string;
  durationRangeName?: string;
  mode: string;
  thumbnailUrl?: string;
  dueLabel?: string;
  bookmarked: boolean;
  bookmarkId?: number;
  roles: ProjectRole[];
};

// 마감일까지 남은 일수 변환
export function getDueLabel(daysUntilDeadline?: number) {
  if (typeof daysUntilDeadline !== 'number') return undefined;
  if (daysUntilDeadline <= 0) return '오늘 마감';
  return `D-${daysUntilDeadline}`;
}

// API position 배열 roles 형태로 반환
export function mapPositionsToRoles(positions: ProjectItem['positions']): ProjectRole[] {
  if (!Array.isArray(positions)) return [];
  return positions.slice(0, 3).map((pos) => ({
    key: pos.position,
    label: pos.positionName,
    tone: getRoleTone(pos.position),
    current: pos.currentCount,
    total: pos.count,
    techStack: [],
  }));
}

type PositionWithTechStacks = {
  position: string;
  positionName: string;
  count: number;
  currentCount: number;
  techStacks?: Array<{ techStack: string }>;
};

/** 추천 API position 배열 → roles (techStack에 id, name 포함) */
export function mapRecommendPositionsToRoles(
  positions: PositionWithTechStacks[] | undefined,
): ProjectRole[] {
  if (!Array.isArray(positions)) return [];
  return positions.slice(0, 3).map((pos, idx) => ({
    key: pos.position,
    label: pos.positionName,
    tone: getRoleTone(pos.position),
    current: pos.currentCount,
    total: pos.count,
    techStack: (pos.techStacks ?? []).slice(0, 5).map((ts, i) => ({
      id: `role-${idx}-${i}-${ts.techStack}`,
      name: ts.techStack,
    })),
  }));
}

// 프로젝트 API 응답 -> 카드 컴포넌트 사용 변환
export function mapProjectItemToCard(p: ProjectItem): ProjectCardModel {
  return {
    id: p.projectId,
    categoryLabel: p.projectFieldName,
    deadlineLabel: p.categoryName,
    title: p.title,
    location: p.location,
    durationRangeName: p.durationRangeName,
    mode: p.modeName,
    thumbnailUrl: p.thumbnailUrl ?? p.imageUrls?.[0] ?? undefined,
    dueLabel: getDueLabel(p.daysUntilDeadline),
    bookmarked: p.bookmarked ?? false,
    bookmarkId: p.bookmarkId,
    roles: mapPositionsToRoles(p.positions),
  };
}
