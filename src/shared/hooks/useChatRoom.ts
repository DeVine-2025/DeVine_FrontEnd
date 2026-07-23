import { fetchChatMessages, markChatRoomRead } from '@apis/chat';
import { ensureStompConnected, onStompConnect } from '@libs/stomp-client';
import type { ChatMessage, ChatMessageListData } from '@t/chat';
import type { IMessage, StompSubscription } from '@stomp/stompjs';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CHAT_ROOMS_QUERY_KEY } from '@hooks/useChatRooms';
import { CHAT_UNREAD_COUNT_QUERY_KEY } from '@hooks/useUnreadChatRoomCount';

export const chatRoomMessagesKey = (roomId: number) => ['chat/rooms', roomId, 'messages'] as const;

type SendMessageRequest = {
  content: string;
};

type SendMessageOptions = {
  senderClerkId?: string | null;
  senderNickname?: string | null;
  senderImage?: string | null;
};

function mergeMessagesUnique(historyAsc: ChatMessage[], realtime: ChatMessage[]): ChatMessage[] {
  const byId = new Map<number, ChatMessage>();
  const pending: ChatMessage[] = [];

  for (const msg of [...historyAsc, ...realtime]) {
    if (msg.messageId < 0) {
      pending.push(msg);
      continue;
    }
    byId.set(msg.messageId, msg);
  }

  const confirmed = [...byId.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  // 서버 에코가 오면 같은 content+보낸이 optimistic(-id)을 제거
  const filteredPending = pending.filter((opt) => {
    return !confirmed.some(
      (c) =>
        c.content === opt.content &&
        c.senderClerkId === opt.senderClerkId &&
        Math.abs(new Date(c.createdAt).getTime() - new Date(opt.createdAt).getTime()) < 60_000,
    );
  });

  return [...confirmed, ...filteredPending];
}

export function useChatRoom(roomId: number, options?: { enabled?: boolean; pageSize?: number }) {
  const enabled = options?.enabled ?? Boolean(roomId);
  const pageSize = options?.pageSize ?? 50;
  const qc = useQueryClient();

  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);
  const subscriptionRef = useRef<StompSubscription | null>(null);

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

    const unsubscribeConnect = onStompConnect((client) => {
      if (cancelled) return;

      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = client.subscribe(
        `/user/queue/chat/${roomId}/messages`,
        (frame: IMessage) => {
          try {
            const msg = JSON.parse(frame.body) as ChatMessage;
            setRealtimeMessages((prev) => {
              if (msg.messageId > 0 && prev.some((m) => m.messageId === msg.messageId)) {
                return prev;
              }
              return [...prev, msg];
            });
            void qc.invalidateQueries({ queryKey: CHAT_ROOMS_QUERY_KEY });
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, roomId]);

  const sendMessage = async (
    content: string,
    sendOptions?: SendMessageOptions,
  ): Promise<void> => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const optimisticId = -Date.now();
    const optimistic: ChatMessage = {
      messageId: optimisticId,
      roomId,
      senderClerkId: sendOptions?.senderClerkId?.trim() || 'me',
      senderNickname: sendOptions?.senderNickname?.trim() || '나',
      senderImage: sendOptions?.senderImage ?? null,
      content: trimmed,
      isRead: true,
      createdAt: new Date().toISOString(),
    };
    setRealtimeMessages((prev) => [...prev, optimistic]);

    const client = await ensureStompConnected();
    const payload: SendMessageRequest = { content: trimmed };

    client.publish({
      destination: `/app/chat/${roomId}/send`,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // 서버가 송신자에게 에코하지 않아도 히스토리로 맞출 수 있게 잠시 후 재조회
    window.setTimeout(() => {
      void qc.invalidateQueries({ queryKey: chatRoomMessagesKey(roomId) });
      void qc.invalidateQueries({ queryKey: CHAT_ROOMS_QUERY_KEY });
    }, 800);
  };

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
    markAsRead: () => markReadMutation.mutateAsync(),
    isMarkingRead: markReadMutation.isPending,
  };
}
