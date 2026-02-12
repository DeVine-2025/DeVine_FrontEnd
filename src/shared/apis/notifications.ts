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

/** SSE 확인용 콘솔 로그 (true면 항상 출력, false면 DEV에서만) */
const SSE_CONSOLE_DEBUG =
  import.meta.env.VITE_SSE_CONSOLE_DEBUG === 'true' || import.meta.env.DEV;

function sseLog(...args: unknown[]) {
  if (SSE_CONSOLE_DEBUG) {
    console.log('[SSE]', ...args);
  }
}

export type SseEventType = 'connect' | 'notification' | 'heartbeat' | 'shutdown';

/** 알림 SSE 구독 옵션 */
export type SubscribeNotificationStreamParams = {
  /** 재연결 대기 시간(ms). 기본 2000 */
  reconnectDelayMs?: number;
  /** 최대 재연결 횟수. 0이면 무제한. 기본 0 */
  maxReconnectAttempts?: number;
};

/** 알림 SSE 이벤트 수신 시 콜백 */
export type NotificationStreamCallbacks = {
  /** notification 이벤트 시 호출 (기존 onMessage 호환) */
  onMessage?: (data: unknown) => void;
  onError?: (err: Error) => void;
  onConnect?: (data: unknown) => void;
  onNotification?: (data: unknown) => void;
  onHeartbeat?: (data: unknown) => void;
  onShutdown?: (data: unknown) => void;
};

/**
 * GET /sse/v1/subscribe (text/event-stream)
 * 이벤트: connect, notification, heartbeat, shutdown
 * 재연결 시 Last-Event-ID 헤더로 놓친 이벤트 수신
 */
export function subscribeNotificationStream(
  token: string,
  callbacks: NotificationStreamCallbacks,
  params?: SubscribeNotificationStreamParams,
  signal?: AbortSignal,
): () => void {
  const reconnectDelayMs = params?.reconnectDelayMs ?? 2000;
  const maxReconnectAttempts = params?.maxReconnectAttempts ?? 0;
  let lastEventId = '';
  let reconnectAttempts = 0;
  let aborted = false;

  signal?.addEventListener('abort', () => {
    aborted = true;
    if (reconnectTimer != null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    sseLog('abort (구독 해제)');
  });

  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const url = `${BASE_URL}/sse/v1/subscribe`;
  sseLog('구독 시작', url);

  function connect(): void {
    if (aborted) return;
    const headers: Record<string, string> = {
      Accept: 'text/event-stream',
      Authorization: `Bearer ${token}`,
    };
    if (lastEventId) {
      headers['Last-Event-ID'] = lastEventId;
      sseLog('재연결 시도', { lastEventId, attempt: reconnectAttempts });
    } else {
      sseLog('연결 요청', url);
    }

    fetch(url, {
      method: 'GET',
      headers,
      signal,
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) sseLog('401 인증 필요 → 로그인 필요');
          if (res.status === 404) sseLog('404 Not Found → 재연결 중단 (엔드포인트 없음)');
          const err = new Error(res.status === 401 ? '인증이 필요합니다.' : `요청 실패 (${res.status})`) as Error & { status?: number };
          err.status = res.status;
          throw err;
        }
        const reader = res.body?.getReader();
        if (!reader) {
          callbacks.onError?.(new Error('스트림을 읽을 수 없습니다.'));
          return;
        }
        reconnectAttempts = 0;
        sseLog('연결 성공 (200 text/event-stream)');

        const decoder = new TextDecoder();
        let buffer = '';
        let currentEvent = '';
        let currentId = '';
        let currentData = '';

        const flushEvent = () => {
          if (!currentEvent) return;
          let data: unknown = null;
          if (currentData) {
            try {
              data = JSON.parse(currentData);
            } catch {
              data = currentData;
            }
          }
          if (currentId) lastEventId = currentId;

          if (currentEvent === 'connect') {
            sseLog('수신 connect', { id: currentId, data });
            callbacks.onConnect?.(data);
          } else if (currentEvent === 'notification') {
            sseLog('수신 notification (unread +1)', { id: currentId, data });
            callbacks.onNotification?.(data);
            callbacks.onMessage?.(data);
          } else if (currentEvent === 'heartbeat') {
            sseLog('수신 heartbeat', { id: currentId });
            callbacks.onHeartbeat?.(data);
          } else if (currentEvent === 'shutdown') {
            sseLog('수신 shutdown', { id: currentId, data });
            callbacks.onShutdown?.(data);
          } else {
            sseLog('수신 기타', { event: currentEvent, id: currentId, data });
          }

          currentEvent = '';
          currentId = '';
          currentData = '';
        };

        const read = (): Promise<void> =>
          reader.read().then(({ done, value }) => {
            if (done) {
              flushEvent();
              sseLog('스트림 종료 → 재연결 예정', { lastEventId });
              scheduleReconnect();
              return;
            }
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (line.startsWith('event:')) {
                flushEvent();
                currentEvent = line.slice(6).trim();
              } else if (line.startsWith('id:')) {
                currentId = line.slice(3).trim();
              } else if (line.startsWith('data:')) {
                currentData = line.slice(5).trim();
              } else if (line === '') {
                flushEvent();
              }
            }
            return read();
          });
        return read();
      })
      .catch((err) => {
        if (aborted || err?.name === 'AbortError') {
          sseLog('연결 중단 (Abort)');
          return;
        }
        const status = (err as Error & { status?: number }).status;
        const isFatal = status === 404 || status === 401;
        if (isFatal) {
          sseLog('에러 (재연결 안 함)', status, err);
        } else {
          sseLog('에러 → 재연결 예정', err);
          scheduleReconnect();
        }
        callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
      });
  }

  function scheduleReconnect() {
    if (aborted) return;
    if (maxReconnectAttempts > 0 && reconnectAttempts >= maxReconnectAttempts) {
      sseLog('최대 재연결 횟수 도달 → 중단', { maxReconnectAttempts });
      return;
    }
    sseLog('재연결 스케줄', { delayMs: reconnectDelayMs, attempt: reconnectAttempts });
    reconnectAttempts += 1;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, reconnectDelayMs);
  }

  connect();

  return () => {
    aborted = true;
    if (reconnectTimer != null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    sseLog('구독 해제됨');
  };
}
