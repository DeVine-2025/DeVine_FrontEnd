import { fetchUnreadChatRoomCount } from '@apis/chat';
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import type { UnreadChatCountData } from '@t/chat';

export const CHAT_UNREAD_COUNT_QUERY_KEY = ['chat/unread-count'] as const;

export function useUnreadChatRoomCount(options?: {
  enabled?: boolean;
  /** 접힌 위젯 배지 갱신용. 기본 false(호출부에서 지정) */
  refetchIntervalMs?: number | false;
}) {
  const { isSignedIn } = useAuth();
  const enabled = (options?.enabled ?? true) && Boolean(isSignedIn);

  return useQuery({
    queryKey: CHAT_UNREAD_COUNT_QUERY_KEY,
    queryFn: async (): Promise<UnreadChatCountData> => {
      return fetchUnreadChatRoomCount();
    },
    enabled,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    refetchInterval: options?.refetchIntervalMs ?? false,
  });
}
