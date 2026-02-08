import { buildQuery } from '@libs/queryString';

const BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

/** GET /api/v1/notifications 쿼리 파라미터 */
export type GetNotificationsParams = {
  unreadOnly?: boolean;
  page?: number; // 0-based
  size?: number;
  sort?: string[];
};

/** 응답 result.notifications[] 한 건 */
export type NotificationDto = {
  id: number;
  type: string;
  title: string;
  content: string;
  referenceId: number;
  sender: {
    id: number;
    nickname: string;
    profileImageUrl: string;
  };
  isRead: boolean;
  createdAt: string; // ISO 8601
};

type NotificationsResponse = {
  result?: {
    notifications: NotificationDto[];
    hasNext: boolean;
    currentPage: number;
  };
};

/** 모달/UI용 알림 아이템 (NotificationModal 등) */
export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffM = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffM < 1) return '방금 전';
  if (diffM < 60) return `${diffM}분 전`;
  if (diffH < 24) return `${diffH}시간 전`;
  if (diffD < 7) return `${diffD}일 전`;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export function mapNotificationToItem(dto: NotificationDto): NotificationItem {
  return {
    id: String(dto.id),
    title: dto.title ?? '',
    description: dto.content ?? '',
    timestamp: formatTimestamp(dto.createdAt),
    isRead: dto.isRead ?? false,
  };
}

export type GetNotificationsResult = {
  notifications: NotificationItem[];
  hasNext: boolean;
  currentPage: number;
};

/**
 * GET /api/v1/notifications
 * 알림 목록 조회 (unreadOnly=true면 읽지 않은 알림만)
 */
export async function getNotifications(
  token: string,
  params?: GetNotificationsParams,
  signal?: AbortSignal,
): Promise<GetNotificationsResult> {
  const qs = buildQuery({
    unreadOnly: params?.unreadOnly,
    page: params?.page ?? 0,
    size: params?.size ?? 20,
    sort: params?.sort,
  });

  const res = await fetch(`${BASE_URL}/api/v1/notifications${qs}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  const json = (await res.json().catch(() => null)) as NotificationsResponse | null;
  if (!res.ok) {
    const message =
      json && typeof (json as { message?: string }).message === 'string'
        ? (json as { message: string }).message
        : `요청 실패 (${res.status})`;
    throw new Error(message);
  }

  const result = json?.result;
  const rawList = result?.notifications ?? [];
  const notifications = rawList.map(mapNotificationToItem);

  return {
    notifications,
    hasNext: result?.hasNext ?? false,
    currentPage: result?.currentPage ?? 0,
  };
}

/**
 * PATCH /api/v1/notifications/{notificationId}/read
 * 특정 알림 읽음 처리
 */
export async function markNotificationAsRead(
  notificationId: number,
  token: string,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      json && typeof (json as { message?: string }).message === 'string'
        ? (json as { message: string }).message
        : `요청 실패 (${res.status})`;
    throw new Error(message);
  }
}

/** PATCH /api/v1/notifications/read-all 응답 */
export type MarkAllAsReadResult = {
  markedCount: number;
};

/**
 * PATCH /api/v1/notifications/read-all
 * 전체 알림 읽음 처리
 */
export async function markAllNotificationsAsRead(
  token: string,
  signal?: AbortSignal,
): Promise<MarkAllAsReadResult> {
  const res = await fetch(`${BASE_URL}/api/v1/notifications/read-all`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  const json = (await res.json().catch(() => null)) as { result?: { markedCount?: number } } | null;
  if (!res.ok) {
    const message =
      json && typeof (json as { message?: string }).message === 'string'
        ? (json as { message: string }).message
        : `요청 실패 (${res.status})`;
    throw new Error(message);
  }

  return { markedCount: json?.result?.markedCount ?? 0 };
}

/**
 * GET /api/v1/notifications/unread-count
 * 읽지 않은 알림 개수 조회
 */
export async function getUnreadNotificationCount(
  token: string,
  signal?: AbortSignal,
): Promise<number> {
  const res = await fetch(`${BASE_URL}/api/v1/notifications/unread-count`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  const json = (await res.json().catch(() => null)) as { result?: { count?: number } } | null;
  if (!res.ok) {
    const message =
      json && typeof (json as { message?: string }).message === 'string'
        ? (json as { message: string }).message
        : `요청 실패 (${res.status})`;
    throw new Error(message);
  }

  return json?.result?.count ?? 0;
}
