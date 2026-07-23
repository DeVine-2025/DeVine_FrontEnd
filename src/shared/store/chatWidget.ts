import { create } from 'zustand';

type ChatWidgetState = {
  /** 외부에서 채팅 위젯을 열 때 포커스할 방 ID (한 번 소비) */
  focusRoomId: number | null;
  requestOpenRoom: (roomId: number) => void;
  clearFocusRoom: () => void;
};

export const useChatWidgetStore = create<ChatWidgetState>((set) => ({
  focusRoomId: null,
  requestOpenRoom: (roomId) => set({ focusRoomId: roomId }),
  clearFocusRoom: () => set({ focusRoomId: null }),
}));
