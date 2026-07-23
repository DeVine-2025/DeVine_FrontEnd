import { isAxiosError, type AxiosResponse } from 'axios';
import { axiosInstance } from '@apis/instance';
import {
  ChatApiError,
  type ChatApiEnvelope,
  type ChatMessageListData,
  type ChatRoomsListData,
  type CreateChatRoomData,
  type MarkChatRoomReadData,
  type UnreadChatCountData,
} from '@t/chat';

const CHAT_PREFIX = '/api/v1/chat';

/**
 * 공통 계약상 본문은 `result`(DELETE 등은 `null`).
 * 구버전 문서 호환으로 `data`가 있으면 그다음으로 사용합니다.
 */
function unwrapChatPayload<T>(body: unknown): T {
  const raw = body as { data?: T; result?: T | null };
  if (raw.result !== undefined) {
    return raw.result as T;
  }
  if (raw.data !== undefined) {
    return raw.data as T;
  }
  throw new ChatApiError(
    '채팅 API 응답 형식이 올바르지 않습니다. (result 필드 없음)',
    0,
    'INVALID_CHAT_ENVELOPE',
    body,
  );
}

async function handleChatRequest<T>(request: Promise<AxiosResponse<ChatApiEnvelope<T>>>): Promise<T> {
  try {
    const res = await request;
    const body = res.data;
    if (body.isSuccess !== true) {
      throw new ChatApiError(
        body.message ?? '채팅 요청이 실패했습니다.',
        res.status,
        typeof body.code === 'string' ? body.code : undefined,
        body,
      );
    }
    return unwrapChatPayload<T>(body);
  } catch (e) {
    if (e instanceof ChatApiError) {
      throw e;
    }
    if (isAxiosError(e)) {
      const body = e.response?.data as Partial<ChatApiEnvelope<unknown>> | undefined;
      throw new ChatApiError(
        typeof body?.message === 'string' ? body.message : e.message,
        e.response?.status ?? 0,
        typeof body?.code === 'string' ? body.code : undefined,
        body,
      );
    }
    throw e;
  }
}

export type CreateChatRoomBody = {
  targetClerkId: string;
};

/** POST /api/v1/chat/rooms — 방 생성 또는 기존 방 반환 */
export async function createOrGetChatRoom(body: CreateChatRoomBody): Promise<CreateChatRoomData> {
  return handleChatRequest(
    axiosInstance.post<ChatApiEnvelope<CreateChatRoomData>>(`${CHAT_PREFIX}/rooms`, body),
  );
}

/** GET /api/v1/chat/rooms — 채팅방 목록 */
export async function fetchChatRooms(): Promise<ChatRoomsListData> {
  return handleChatRequest(
    axiosInstance.get<ChatApiEnvelope<ChatRoomsListData>>(`${CHAT_PREFIX}/rooms`),
  );
}

export type FetchChatMessagesParams = {
  page?: number;
  size?: number;
  sort?: 'createdAt,desc' | 'createdAt,asc';
};

/** GET /api/v1/chat/rooms/{roomId}/messages 메시지 목록 조회 */
export async function fetchChatMessages(
  roomId: number,
  params?: FetchChatMessagesParams,
): Promise<ChatMessageListData> {
  const page = params?.page ?? 0;
  const size = params?.size ?? 50;
  const sort = params?.sort ?? 'createdAt,desc';
  return handleChatRequest(
    axiosInstance.get<ChatApiEnvelope<ChatMessageListData>>(
      `${CHAT_PREFIX}/rooms/${roomId}/messages`,
      { params: { page, size, sort } },
    ),
  );
}

/** PATCH /api/v1/chat/rooms/{roomId}/read 메시지 읽음 처리 */
export async function markChatRoomRead(roomId: number): Promise<MarkChatRoomReadData> {
  return handleChatRequest(
    axiosInstance.patch<ChatApiEnvelope<MarkChatRoomReadData>>(
      `${CHAT_PREFIX}/rooms/${roomId}/read`,
    ),
  );
}

/** DELETE /api/v1/chat/rooms/{roomId} 채팅방 나가기 */
export async function leaveChatRoom(roomId: number): Promise<void> {
  await handleChatRequest(
    axiosInstance.delete<ChatApiEnvelope<null>>(`${CHAT_PREFIX}/rooms/${roomId}`),
  );
}

/** GET /api/v1/chat/unread-count 안 읽은 채팅방 수 */
export async function fetchUnreadChatRoomCount(): Promise<UnreadChatCountData> {
  return handleChatRequest(
    axiosInstance.get<ChatApiEnvelope<UnreadChatCountData>>(`${CHAT_PREFIX}/unread-count`),
  );
}

export function isChatApiError(e: unknown): e is ChatApiError {
  return e instanceof ChatApiError;
}
