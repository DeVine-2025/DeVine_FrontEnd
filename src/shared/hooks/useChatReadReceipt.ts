import { onStompConnect, ensureStompConnected } from '@libs/stomp-client';
import type { StompSubscription } from '@stomp/stompjs';
import { useEffect } from 'react';

export type ChatReadReceipt = {
  roomId: number;
  readerClerkId: string;
};

export function useChatReadReceipt(options: {
  enabled?: boolean;
  onRead: (receipt: ChatReadReceipt) => void;
}) {
  const enabled = options.enabled ?? true;

  useEffect(() => {
    if (!enabled) return;

    let subscription: StompSubscription | null = null;

    const unsubscribeConnect = onStompConnect((client) => {
      subscription?.unsubscribe();
      subscription = client.subscribe('/user/queue/chat/read', (frame) => {
        const parsed = JSON.parse(frame.body) as ChatReadReceipt;
        options.onRead(parsed);
      });
    });

    // 연결 자체는 구독 훅에서 보장 x시, 아무 일도 안 일어날 수 있어 먼저 활성화
    void ensureStompConnected();

    return () => {
      unsubscribeConnect();
      subscription?.unsubscribe();
      subscription = null;
    };
  }, [enabled, options]);
}

