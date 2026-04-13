import { ensureStompConnected, onStompConnect } from '@libs/stomp-client';
import type { StompSubscription } from '@stomp/stompjs';
import { useEffect } from 'react';

export type ChatSocketErrorPayload = unknown;

export function useChatErrorQueue(options: {
  enabled?: boolean;
  onError: (payload: ChatSocketErrorPayload) => void;
}) {
  const enabled = options.enabled ?? true;

  useEffect(() => {
    if (!enabled) return;

    let subscription: StompSubscription | null = null;

    const unsubscribeConnect = onStompConnect((client) => {
      subscription?.unsubscribe();
      subscription = client.subscribe('/user/queue/errors', (frame) => {
        let payload: unknown = frame.body;
        try {
          payload = JSON.parse(frame.body) as unknown;
        } catch {
          // keep raw string
        }
        options.onError(payload);
      });
    });

    void ensureStompConnected();

    return () => {
      unsubscribeConnect();
      subscription?.unsubscribe();
      subscription = null;
    };
  }, [enabled, options]);
}

