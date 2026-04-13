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
          const msg = JSON.parse(frame.body) as ChatMessage;
          setRealtimeMessages((prev) => [...prev, msg]);
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

  const sendMessage = async (content: string): Promise<void> => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const client = await ensureStompConnected();
    const payload: SendMessageRequest = { content: trimmed };

    client.publish({
      destination: `/app/chat/${roomId}/send`,
      body: JSON.stringify(payload),
    });
  };

  const messagesAsc = useMemo(() => {
    const pages = historyQuery.data?.pages ?? [];
    const desc = pages.flatMap((p) => p.messages);
    const asc = desc.slice().reverse();
    return [...asc, ...realtimeMessages];
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

