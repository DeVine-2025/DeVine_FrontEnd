import { fetchChatRooms } from '@apis/chat';
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import type { ChatRoomsListData } from '@t/chat';

export const CHAT_ROOMS_QUERY_KEY = ['chat/rooms'] as const;

export function useChatRooms(options?: {
  enabled?: boolean;
  refetchIntervalMs?: number | false;
}) {
  const { isSignedIn } = useAuth();
  const enabled = (options?.enabled ?? true) && Boolean(isSignedIn);

  return useQuery({
    queryKey: CHAT_ROOMS_QUERY_KEY,
    queryFn: async (): Promise<ChatRoomsListData> => {
      return fetchChatRooms();
    },
    enabled,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    refetchInterval: options?.refetchIntervalMs ?? false,
  });
}
