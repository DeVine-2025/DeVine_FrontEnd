import { createOrGetChatRoom } from '@apis/chat';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CHAT_ROOMS_QUERY_KEY } from '@hooks/useChatRooms';
import { CHAT_UNREAD_COUNT_QUERY_KEY } from '@hooks/useUnreadChatRoomCount';

export function useCreateOrGetChatRoom() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: { targetClerkId: string }) => {
      return createOrGetChatRoom({ targetClerkId: params.targetClerkId });
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: CHAT_ROOMS_QUERY_KEY }),
        qc.invalidateQueries({ queryKey: CHAT_UNREAD_COUNT_QUERY_KEY }),
      ]);
    },
  });
}

