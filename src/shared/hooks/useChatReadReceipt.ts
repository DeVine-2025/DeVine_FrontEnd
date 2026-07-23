import type { ChatReadEvent } from '@t/chat';
import { onStompConnect, ensureStompConnected } from '@libs/stomp-client';
import type { StompSubscription } from '@stomp/stompjs';
import { useEffect, useRef } from 'react';

export type ChatReadReceipt = ChatReadEvent;

export function useChatReadReceipt(options: {
  enabled?: boolean;
  onRead: (receipt: ChatReadReceipt) => void;
}) {
  const enabled = options.enabled ?? true;
  const onReadRef = useRef(options.onRead);
  onReadRef.current = options.onRead;

  useEffect(() => {
    if (!enabled) return;

    let subscription: StompSubscription | null = null;

    const unsubscribeConnect = onStompConnect((client) => {
      subscription?.unsubscribe();
      subscription = client.subscribe('/user/queue/chat/read', (frame) => {
        try {
          const parsed = JSON.parse(frame.body) as ChatReadEvent;
          onReadRef.current(parsed);
        } catch (e) {
          console.error('[chat] STOMP read receipt parse failed', e, frame.body);
        }
      });
    });

    void ensureStompConnected();

    return () => {
      unsubscribeConnect();
      subscription?.unsubscribe();
      subscription = null;
    };
  }, [enabled]);
}
