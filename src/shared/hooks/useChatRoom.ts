import { fetchChatMessages, markChatRoomRead } from '@apis/chat';
import { ensureStompConnected, getStompClient, onStompConnect } from '@libs/stomp-client';
import type { ChatMessage, ChatMessageListData } from '@t/chat';
import type { IMessage, StompSubscription } from '@stomp/stompjs';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CHAT_ROOMS_QUERY_KEY } from '@hooks/useChatRooms';
import { CHAT_UNREAD_COUNT_QUERY_KEY } from '@hooks/useUnreadChatRoomCount';
import { useChatErrorQueue } from '@hooks/useChatErrorQueue';

export const chatRoomMessagesKey = (roomId: number) => ['chat/rooms', roomId, 'messages'] as const;

export type ChatLocalSendStatus = 'sending' | 'failed';

export type ChatDisplayMessage = ChatMessage & {
  localStatus?: ChatLocalSendStatus;
};

type SendMessageRequest = {
  content: string;
};

type SendMessageOptions = {
  senderClerkId?: string | null;
  senderNickname?: string | null;
  senderImage?: string | null;
};

/** 소켓은 살아 있는데 에코가 없을 때만 (오프라인은 즉시 failed) */
const SEND_ECHO_TIMEOUT_MS = 1_200;

/**
 * 같은 내용의 이전 성공 메시지와 optimistic(실패)을 잘못 매칭하지 않음.
 * - failed: 절대 자동 제거하지 않음 (사용자가 삭제할 때만)
 * - sending: 이 시도 시각 이후에 생긴 서버 메시지와만 매칭
 */
function isConfirmedAfterAttempt(opt: ChatDisplayMessage, confirmed: ChatMessage): boolean {
  if (opt.content !== confirmed.content) return false;
  if (opt.senderClerkId !== confirmed.senderClerkId) return false;
  const optAt = new Date(opt.createdAt).getTime();
  const confAt = new Date(confirmed.createdAt).getTime();
  // 서버 시각이 시도보다 너무 이전이면(같은 내용 과거 메시지) 매칭 금지
  return confAt >= optAt - 3_000;
}

function mergeMessagesUnique(
  historyAsc: ChatMessage[],
  realtime: ChatDisplayMessage[],
): ChatDisplayMessage[] {
  const byId = new Map<number, ChatDisplayMessage>();
  const pending: ChatDisplayMessage[] = [];

  for (const msg of [...historyAsc, ...realtime]) {
    if (msg.messageId < 0) {
      pending.push(msg as ChatDisplayMessage);
      continue;
    }
    byId.set(msg.messageId, msg);
  }

  const confirmed = [...byId.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const filteredPending = pending.filter((opt) => {
    if (opt.localStatus === 'failed') return true;
    if (opt.localStatus === 'sending') {
      return !confirmed.some((c) => isConfirmedAfterAttempt(opt, c));
    }
    // localStatus 없는 구형 optimistic
    return !confirmed.some((c) => isConfirmedAfterAttempt(opt, c));
  });

  return [...confirmed, ...filteredPending];
}

export function useChatRoom(roomId: number, options?: { enabled?: boolean; pageSize?: number }) {
  const enabled = options?.enabled ?? Boolean(roomId);
  const pageSize = options?.pageSize ?? 50;
  const qc = useQueryClient();

  const [realtimeMessages, setRealtimeMessages] = useState<ChatDisplayMessage[]>([]);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const confirmTimersRef = useRef<Map<number, number>>(new Map());
  const sendMetaRef = useRef<
    Map<number, { senderClerkId: string; senderNickname: string; senderImage: string | null }>
  >(new Map());

  const clearConfirmTimer = useCallback((messageId: number) => {
    const timer = confirmTimersRef.current.get(messageId);
    if (timer != null) {
      window.clearTimeout(timer);
      confirmTimersRef.current.delete(messageId);
    }
  }, []);

  const markLocalFailed = useCallback(
    (messageId: number) => {
      clearConfirmTimer(messageId);
      setRealtimeMessages((prev) =>
        prev.map((m) =>
          m.messageId === messageId && m.messageId < 0
            ? { ...m, localStatus: 'failed' as const }
            : m,
        ),
      );
    },
    [clearConfirmTimer],
  );

  const markAllSendingFailed = useCallback(() => {
    setRealtimeMessages((prev) =>
      prev.map((m) => {
        if (m.messageId < 0 && m.localStatus === 'sending') {
          clearConfirmTimer(m.messageId);
          return { ...m, localStatus: 'failed' as const };
        }
        return m;
      }),
    );
  }, [clearConfirmTimer]);

  const scheduleConfirmTimeout = useCallback(
    (messageId: number) => {
      clearConfirmTimer(messageId);
      const timer = window.setTimeout(() => {
        markLocalFailed(messageId);
      }, SEND_ECHO_TIMEOUT_MS);
      confirmTimersRef.current.set(messageId, timer);
    },
    [clearConfirmTimer, markLocalFailed],
  );

  const historyQuery = useInfiniteQuery({
    queryKey: chatRoomMessagesKey(roomId),
    enabled,
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<ChatMessageListData> => {
      return fetchChatMessages(roomId, { page: pageParam, size: pageSize, sort: 'createdAt,desc' });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.currentPage + 1 : undefined;
    },
    staleTime: 15_000,
  });

  const markReadMutation = useMutation({
    mutationFn: async () => {
      return markChatRoomRead(roomId);
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: CHAT_ROOMS_QUERY_KEY }),
        qc.invalidateQueries({ queryKey: CHAT_UNREAD_COUNT_QUERY_KEY }),
      ]);
    },
  });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    setRealtimeMessages([]);
    for (const timer of confirmTimersRef.current.values()) {
      window.clearTimeout(timer);
    }
    confirmTimersRef.current.clear();
    sendMetaRef.current.clear();

    const unsubscribeConnect = onStompConnect((client) => {
      if (cancelled) return;

      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = client.subscribe(
        `/user/queue/chat/${roomId}/messages`,
        (frame: IMessage) => {
          try {
            const msg = JSON.parse(frame.body) as ChatMessage;
            setRealtimeMessages((prev) => {
              const matched = prev.filter(
                (m) =>
                  m.messageId < 0 &&
                  m.localStatus === 'sending' &&
                  isConfirmedAfterAttempt(m, msg),
              );
              for (const m of matched) {
                clearConfirmTimer(m.messageId);
                sendMetaRef.current.delete(m.messageId);
              }
              const withoutMatched = prev.filter((m) => !matched.includes(m));
              if (msg.messageId > 0 && withoutMatched.some((m) => m.messageId === msg.messageId)) {
                return withoutMatched;
              }
              return [...withoutMatched, msg];
            });
            void qc.invalidateQueries({ queryKey: CHAT_ROOMS_QUERY_KEY });
            void qc.invalidateQueries({ queryKey: CHAT_UNREAD_COUNT_QUERY_KEY });
          } catch (e) {
            console.error('[chat] STOMP message parse failed', e, frame.body);
          }
        },
      );
    });

    void ensureStompConnected()
      .then(() => markReadMutation.mutateAsync())
      .catch(() => {});

    return () => {
      cancelled = true;
      unsubscribeConnect();
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      for (const timer of confirmTimersRef.current.values()) {
        window.clearTimeout(timer);
      }
      confirmTimersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, roomId]);

  // 히스토리 refetch: failed는 유지, sending만 "이번 시도 이후" 확정분과 매칭 시 제거
  useEffect(() => {
    const pages = historyQuery.data?.pages ?? [];
    const confirmed = pages.flatMap((p) => p.messages);
    setRealtimeMessages((prev) => {
      let changed = false;
      const next = prev.filter((opt) => {
        if (opt.messageId >= 0) return true;
        if (opt.localStatus === 'failed') return true;
        if (opt.localStatus !== 'sending') return true;
        const hit = confirmed.some((c) => isConfirmedAfterAttempt(opt, c));
        if (hit) {
          changed = true;
          clearConfirmTimer(opt.messageId);
          sendMetaRef.current.delete(opt.messageId);
          return false;
        }
        return true;
      });
      return changed ? next : prev;
    });
  }, [historyQuery.data, clearConfirmTimer]);

  useChatErrorQueue({
    enabled,
    onError: markAllSendingFailed,
  });

  useEffect(() => {
    if (!enabled) return;
    const onOffline = () => markAllSendingFailed();
    window.addEventListener('offline', onOffline);
    return () => window.removeEventListener('offline', onOffline);
  }, [enabled, markAllSendingFailed]);

  const isSendBlocked = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
    return !getStompClient()?.connected;
  }, []);

  const publishContent = useCallback(
    (content: string, localId: number) => {
      if (isSendBlocked()) {
        markLocalFailed(localId);
        void ensureStompConnected().catch(() => {});
        return;
      }

      const client = getStompClient();
      if (!client?.connected) {
        markLocalFailed(localId);
        return;
      }

      try {
        client.publish({
          destination: `/app/chat/${roomId}/send`,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ content } satisfies SendMessageRequest),
        });
        scheduleConfirmTimeout(localId);
        window.setTimeout(() => {
          void qc.invalidateQueries({ queryKey: chatRoomMessagesKey(roomId) });
          void qc.invalidateQueries({ queryKey: CHAT_ROOMS_QUERY_KEY });
        }, 800);
      } catch {
        markLocalFailed(localId);
      }
    },
    [roomId, qc, scheduleConfirmTimeout, markLocalFailed, isSendBlocked],
  );

  const sendMessage = async (
    content: string,
    sendOptions?: SendMessageOptions,
  ): Promise<void> => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const optimisticId = -Date.now();
    const senderClerkId = sendOptions?.senderClerkId?.trim() || 'me';
    const senderNickname = sendOptions?.senderNickname?.trim() || '나';
    const senderImage = sendOptions?.senderImage ?? null;

    sendMetaRef.current.set(optimisticId, { senderClerkId, senderNickname, senderImage });

    const optimistic: ChatDisplayMessage = {
      messageId: optimisticId,
      roomId,
      senderClerkId,
      senderNickname,
      senderImage,
      content: trimmed,
      isRead: true,
      createdAt: new Date().toISOString(),
      localStatus: 'sending',
    };
    setRealtimeMessages((prev) => [...prev, optimistic]);
    publishContent(trimmed, optimisticId);
  };

  const removeFailedMessage = useCallback(
    (messageId: number) => {
      clearConfirmTimer(messageId);
      sendMetaRef.current.delete(messageId);
      setRealtimeMessages((prev) => prev.filter((m) => m.messageId !== messageId));
    },
    [clearConfirmTimer],
  );

  const messagesAsc = useMemo(() => {
    const pages = historyQuery.data?.pages ?? [];
    const desc = pages.flatMap((p) => p.messages);
    const asc = desc.slice().reverse();
    return mergeMessagesUnique(asc, realtimeMessages);
  }, [historyQuery.data, realtimeMessages]);

  return {
    messages: messagesAsc,
    realtimeMessages,
    historyQuery,
    sendMessage,
    removeFailedMessage,
    markAsRead: () => markReadMutation.mutateAsync(),
    isMarkingRead: markReadMutation.isPending,
  };
}
