import { fetchChatRooms } from '@apis/chat';
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import type { ChatRoomsListData } from '@t/chat';

export const CHAT_ROOMS_QUERY_KEY = ['chat/rooms'] as const;

export function useChatRooms(options?: { enabled?: boolean }) {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: CHAT_ROOMS_QUERY_KEY,
    queryFn: async (): Promise<ChatRoomsListData> => {
      return fetchChatRooms();
    },
    enabled: options?.enabled ?? isSignedIn ?? false,
    staleTime: 15_000,
  });
}

