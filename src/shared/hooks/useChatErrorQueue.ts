import { ensureStompConnected, onStompConnect } from '@libs/stomp-client';
import type { StompSubscription } from '@stomp/stompjs';
import { useEffect, useRef } from 'react';

export type ChatSocketErrorPayload = unknown;

export function useChatErrorQueue(options: {
  enabled?: boolean;
  onError: (payload: ChatSocketErrorPayload) => void;
}) {
  const enabled = options.enabled ?? true;
  const onErrorRef = useRef(options.onError);
  onErrorRef.current = options.onError;

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
        onErrorRef.current(payload);
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
