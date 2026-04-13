import { fetchUnreadChatRoomCount } from '@apis/chat';
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import type { UnreadChatCountData } from '@t/chat';

export const CHAT_UNREAD_COUNT_QUERY_KEY = ['chat/unread-count'] as const;

export function useUnreadChatRoomCount(options?: { enabled?: boolean }) {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: CHAT_UNREAD_COUNT_QUERY_KEY,
    queryFn: async (): Promise<UnreadChatCountData> => {
      return fetchUnreadChatRoomCount();
    },
    enabled: options?.enabled ?? isSignedIn ?? false,
    staleTime: 15_000,
  });
}

