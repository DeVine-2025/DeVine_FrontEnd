import { create } from 'zustand';

export type ChatDraftTarget = {
  targetClerkId: string;
  nickname?: string;
  image?: string | null;
};

type ChatWidgetState = {
  /** 기존 방 포커스 (한 번 소비) */
  focusRoomId: number | null;
  /** 방 없이 UI만 열기 — 첫 전송 시 POST /rooms (한 번 소비) */
  focusDraft: ChatDraftTarget | null;
  requestOpenRoom: (roomId: number) => void;
  requestOpenDraft: (draft: ChatDraftTarget) => void;
  clearFocusRoom: () => void;
  clearFocusDraft: () => void;
};

export const useChatWidgetStore = create<ChatWidgetState>((set) => ({
  focusRoomId: null,
  focusDraft: null,
  requestOpenRoom: (roomId) => set({ focusRoomId: roomId, focusDraft: null }),
  requestOpenDraft: (draft) => set({ focusDraft: draft, focusRoomId: null }),
  clearFocusRoom: () => set({ focusRoomId: null }),
  clearFocusDraft: () => set({ focusDraft: null }),
}));
