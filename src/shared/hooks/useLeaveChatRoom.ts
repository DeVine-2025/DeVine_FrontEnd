import { leaveChatRoom } from '@apis/chat';
import { CHAT_ROOMS_QUERY_KEY } from '@hooks/useChatRooms';
import { CHAT_UNREAD_COUNT_QUERY_KEY } from '@hooks/useUnreadChatRoomCount';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useLeaveChatRoom() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: { roomId: number }) => {
      await leaveChatRoom(params.roomId);
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: CHAT_ROOMS_QUERY_KEY }),
        qc.invalidateQueries({ queryKey: CHAT_UNREAD_COUNT_QUERY_KEY }),
      ]);
    },
  });
}

