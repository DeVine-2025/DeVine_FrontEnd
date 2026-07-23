import type { ApiResponse } from '@apis/base/api';

export type ChatApiEnvelope<T> = ApiResponse<T>;

export class ChatApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly body?: unknown;

  constructor(message: string, status: number, code?: string, body?: unknown) {
    super(message);
    this.name = 'ChatApiError';
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

export type ChatOtherMember = {
  clerkId: string;
  nickname: string;
  image: string | null;
  mainType: string;
};

export type ChatMessage = {
  messageId: number;
  roomId?: number;
  senderClerkId: string;
  senderNickname: string;
  senderImage: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
};

export type ChatMessageEvent = ChatMessage;

export type ChatReadEvent = {
  roomId: number;
  readerClerkId: string;
};

export type ChatRoomSummary = {
  roomId: number;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  otherMember: ChatOtherMember;
};

export type CreateChatRoomData = {
  roomId: number;
  otherMember: ChatOtherMember;
};

export type ChatRoomsListData = {
  rooms: ChatRoomSummary[];
};

export type ChatMessageListData = {
  messages: ChatMessage[];
  hasNext: boolean;
  currentPage: number;
};

export type MarkChatRoomReadData = {
  unreadRoomCount: number;
};

export type UnreadChatCountData = {
  unreadRoomCount: number;
};
