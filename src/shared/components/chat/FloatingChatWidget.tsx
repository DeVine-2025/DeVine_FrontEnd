import ArrowLeftIcon from '@assets/icons/arrow-left.svg?react';
import ChatPaperPlaneIcon from '@assets/icons/chat-paper-plane.svg?react';
import ChatSendPlaneIcon from '@assets/icons/chat-send-plane.svg?react';
import CloseIcon from '@assets/icons/close.svg?react';
import { isChatApiError } from '@apis/chat';
import { useChatRoom } from '@hooks/useChatRoom';
import { useChatRooms, CHAT_ROOMS_QUERY_KEY } from '@hooks/useChatRooms';
import { useCreateOrGetChatRoom } from '@hooks/useCreateOrGetChatRoom';
import { useLeaveChatRoom } from '@hooks/useLeaveChatRoom';
import { useUnreadChatRoomCount } from '@hooks/useUnreadChatRoomCount';
import { cn } from '@libs/cn';
import { type ChatDraftTarget, useChatWidgetStore } from '@store/chatWidget';
import { useThemeStore } from '@store/theme';
import type { ChatRoomsListData } from '@t/chat';
import { useAuth } from '@clerk/clerk-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import './floating-chat-widget.css';

const ChatAvatar = ({
  image,
  name,
  className,
  isLightTheme,
}: {
  image?: string | null;
  name: string;
  className: string;
  isLightTheme: boolean;
}) => (
  <span
    className={cn(
      'flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold',
      isLightTheme ? 'bg-[#EEE9FF] text-[#6552C9]' : 'bg-[rgba(112,85,245,0.16)] text-[#B7A8FF]',
      className,
    )}
  >
    {image ? (
      <img src={image} alt="" className="size-full object-cover" />
    ) : (
      name.trim().slice(0, 1) || '?'
    )}
  </span>
);

const DEFAULT_CHAT_WIDTH_PX = 310;
const DEFAULT_CHAT_HEIGHT_PX = 458;
const MIN_CHAT_WIDTH_PX = 280;
const MIN_CHAT_HEIGHT_PX = 320;
const CHAT_SIZE_STORAGE_KEY = 'devine.chatWidget.size';
const CHAT_POSITION_STORAGE_KEY = 'devine.chatWidget.position';
const DESKTOP_RESIZE_MQ = '(min-width: 744px)';

type ChatPanelSize = { width: number; height: number };
type ChatPosition = { left: number; bottom: number };
type ResizeEdge = 'left' | 'top' | 'corner';

function readStoredChatPosition(): ChatPosition | null {
  try {
    const raw = window.localStorage.getItem(CHAT_POSITION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ChatPosition>;
    return typeof parsed.left === 'number' && Number.isFinite(parsed.left) &&
      typeof parsed.bottom === 'number' && Number.isFinite(parsed.bottom)
      ? { left: parsed.left, bottom: parsed.bottom }
      : null;
  } catch {
    return null;
  }
}

function clampChatPosition(position: ChatPosition, width: number, height: number): ChatPosition {
  const margin = 12;
  return {
    left: Math.min(Math.max(margin, window.innerWidth - width - margin), Math.max(margin, position.left)),
    bottom: Math.min(Math.max(margin, window.innerHeight - height - margin), Math.max(margin, position.bottom)),
  };
}

function readStoredChatSize(): ChatPanelSize {
  try {
    const raw = window.localStorage.getItem(CHAT_SIZE_STORAGE_KEY);
    if (!raw) return { width: DEFAULT_CHAT_WIDTH_PX, height: DEFAULT_CHAT_HEIGHT_PX };
    const parsed = JSON.parse(raw) as Partial<ChatPanelSize>;
    const width = typeof parsed.width === 'number' ? parsed.width : DEFAULT_CHAT_WIDTH_PX;
    const height = typeof parsed.height === 'number' ? parsed.height : DEFAULT_CHAT_HEIGHT_PX;
    return { width, height };
  } catch {
    return { width: DEFAULT_CHAT_WIDTH_PX, height: DEFAULT_CHAT_HEIGHT_PX };
  }
}

function clampChatSize(size: ChatPanelSize): ChatPanelSize {
  const maxWidth = Math.max(MIN_CHAT_WIDTH_PX, window.innerWidth - 20);
  const maxHeight = Math.max(MIN_CHAT_HEIGHT_PX, window.innerHeight - 12);
  return {
    width: Math.min(maxWidth, Math.max(MIN_CHAT_WIDTH_PX, Math.round(size.width))),
    height: Math.min(maxHeight, Math.max(MIN_CHAT_HEIGHT_PX, Math.round(size.height))),
  };
}

function useDesktopChatResizeEnabled() {
  const [enabled, setEnabled] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(DESKTOP_RESIZE_MQ).matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_RESIZE_MQ);
    const onChange = () => setEnabled(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return enabled;
}

const formatTime = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatDateLabel = (iso?: string | null): string => {
  if (!iso) return '오늘';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '오늘';
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

/* 목록 우측 메타: 마지막 메시지가 도착한 뒤 지난 시간 */
const formatListLastContactLabel = (iso?: string | null, now = Date.now()): string => {
  if (!iso) return '';
  const sentAt = new Date(iso).getTime();
  if (Number.isNaN(sentAt)) return '';
  const elapsedMinutes = Math.max(0, Math.floor((now - sentAt) / 60_000));
  if (elapsedMinutes < 1) return '방금';
  if (elapsedMinutes < 60) return `${elapsedMinutes}분`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}시간`;
  return `${Math.floor(elapsedHours / 24)}일`;
};

const FloatingChatWidget = () => {
  const { theme } = useThemeStore();
  const { userId } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [relativeTimeNow, setRelativeTimeNow] = useState(() => Date.now());
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [failedActionMessageId, setFailedActionMessageId] = useState<number | null>(null);
  const [isRoomMenuOpen, setIsRoomMenuOpen] = useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [leaveErrorMessage, setLeaveErrorMessage] = useState<string | null>(null);
  const [draftTarget, setDraftTarget] = useState<ChatDraftTarget | null>(null);
  const [pendingFirstMessage, setPendingFirstMessage] = useState<string | null>(null);
  const [panelSize, setPanelSize] = useState<ChatPanelSize>(() =>
    typeof window !== 'undefined' ? clampChatSize(readStoredChatSize()) : {
      width: DEFAULT_CHAT_WIDTH_PX,
      height: DEFAULT_CHAT_HEIGHT_PX,
    },
  );
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState<ChatPosition | null>(() =>
    typeof window !== 'undefined' ? readStoredChatPosition() : null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const widgetRef = useRef<HTMLElement | null>(null);
  const dragCleanupRef = useRef<(() => void) | null>(null);
  const lastDragEndRef = useRef(0);
  const failedMenuRef = useRef<HTMLDivElement | null>(null);
  const roomMenuRef = useRef<HTMLDivElement | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const prevRoomIdForScrollRef = useRef<number | null>(null);
  const prevLastMessageIdForScrollRef = useRef<number | null>(null);
  const isLoadingOlderRef = useRef(false);
  const resizeSessionRef = useRef<{
    edge: ResizeEdge;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);
  const isLightTheme = theme === 'light';
  const canResizePanel = useDesktopChatResizeEnabled();
  const openListVersion = useChatWidgetStore(s => s.openListVersion);
  useEffect(() => {
    if (!openListVersion) return;
    setSelectedChatId(null); setDraftTarget(null); setIsExpanded(true);
  }, [openListVersion]);
  const focusRoomId = useChatWidgetStore((s) => s.focusRoomId);
  const focusDraft = useChatWidgetStore((s) => s.focusDraft);
  const clearFocusRoom = useChatWidgetStore((s) => s.clearFocusRoom);
  const clearFocusDraft = useChatWidgetStore((s) => s.clearFocusDraft);
  const leaveChatRoomMutation = useLeaveChatRoom();
  const createRoomMutation = useCreateOrGetChatRoom();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!canResizePanel) return;
    const onWindowResize = () => {
      setPanelSize((prev) => clampChatSize(prev));
      const widget = widgetRef.current;
      if (widget) {
        const { width, height } = widget.getBoundingClientRect();
        setPosition((current) => current && clampChatPosition(current, width, height));
      }
    };
    window.addEventListener('resize', onWindowResize);
    return () => window.removeEventListener('resize', onWindowResize);
  }, [canResizePanel]);

  useEffect(() => () => dragCleanupRef.current?.(), []);

  const beginWidgetDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!canResizePanel || event.button !== 0 || !event.isPrimary) return;
      if (isExpanded && (event.target as Element).closest('button, a, input, textarea, [data-no-drag]')) return;
      const widget = widgetRef.current;
      if (!widget) return;
      const rect = widget.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = rect.left;
      const startBottom = window.innerHeight - rect.bottom;
      let moved = false;
      let latestPosition: ChatPosition | null = null;

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== event.pointerId) return;
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        if (!moved && Math.hypot(deltaX, deltaY) < 5) return;
        moved = true;
        setIsDragging(true);
        latestPosition = clampChatPosition(
          { left: startLeft + deltaX, bottom: startBottom - deltaY },
          rect.width,
          rect.height,
        );
        setPosition(latestPosition);
      };

      const cleanup = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
        dragCleanupRef.current = null;
        setIsDragging(false);
      };
      const onPointerUp = (upEvent: PointerEvent) => {
        if (upEvent.pointerId !== event.pointerId) return;
        cleanup();
        if (!moved || !latestPosition) return;
        if (!isExpanded) lastDragEndRef.current = Date.now();
        try {
          window.localStorage.setItem(CHAT_POSITION_STORAGE_KEY, JSON.stringify(latestPosition));
        } catch {
          // Storage may be unavailable; keep the position for this session.
        }
      };

      dragCleanupRef.current?.();
      dragCleanupRef.current = cleanup;
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    },
    [canResizePanel, isExpanded],
  );

  const beginPanelResize = useCallback(
    (edge: ResizeEdge, event: ReactPointerEvent<HTMLDivElement>) => {
      if (!canResizePanel || !isExpanded) return;
      event.preventDefault();
      event.stopPropagation();
      resizeSessionRef.current = {
        edge,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: panelSize.width,
        startHeight: panelSize.height,
      };
      setIsResizing(true);

      const onPointerMove = (moveEvent: PointerEvent) => {
        const session = resizeSessionRef.current;
        if (!session) return;
        let nextWidth = session.startWidth;
        let nextHeight = session.startHeight;
        if (session.edge === 'left' || session.edge === 'corner') {
          nextWidth = session.startWidth + (session.startX - moveEvent.clientX);
        }
        if (session.edge === 'top' || session.edge === 'corner') {
          nextHeight = session.startHeight + (session.startY - moveEvent.clientY);
        }
        setPanelSize(clampChatSize({ width: nextWidth, height: nextHeight }));
      };

      const onPointerUp = () => {
        resizeSessionRef.current = null;
        setIsResizing(false);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        setPanelSize((current) => {
          const next = clampChatSize(current);
          try {
            window.localStorage.setItem(CHAT_SIZE_STORAGE_KEY, JSON.stringify(next));
          } catch {
            // ignore
          }
          return next;
        });
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    },
    [canResizePanel, isExpanded, panelSize.height, panelSize.width],
  );

  const { data: roomsData, refetch: refetchRooms } = useChatRooms({
    enabled: true,
    refetchIntervalMs: 30_000,
  });
  // 접힌 상태에서도 배지용으로 unread 조회
  const { data: unreadData } = useUnreadChatRoomCount({
    enabled: true,
    refetchIntervalMs: 30_000,
  });
  const rooms = roomsData?.rooms ?? [];
  const selectedRoom = rooms.find((room) => room.roomId === selectedChatId) ?? null;
  const activeRoomId = selectedChatId ?? 0;
  const isDraftChat = draftTarget != null && activeRoomId <= 0;
  const isRoomView = activeRoomId > 0 || isDraftChat;
  const chatRoom = useChatRoom(activeRoomId, {
    enabled: isExpanded && activeRoomId > 0,
  });
  const selectedMessages = chatRoom.messages;
  const hasMessageDraft = messageDraft.trim().length > 0;
  const unreadRoomCount = unreadData?.unreadRoomCount ?? 0;
  const unreadBadgeLabel = unreadRoomCount > 99 ? '99+' : String(unreadRoomCount);
  const chatListPanelHeightRem = rooms.length === 0 ? 24.8 : 7.2 + Math.min(rooms.length, 4) * 7.7;
  useEffect(() => {
    if (!isExpanded || isRoomView) return;
    setRelativeTimeNow(Date.now());
    const interval = window.setInterval(() => setRelativeTimeNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, [isExpanded, isRoomView]);
  useLayoutEffect(() => {
    if (!canResizePanel || !position || !widgetRef.current) return;
    const { width, height } = widgetRef.current.getBoundingClientRect();
    setPosition((current) => {
      if (!current) return current;
      const clamped = clampChatPosition(current, width, height);
      return clamped.left === current.left && clamped.bottom === current.bottom ? current : clamped;
    });
  }, [canResizePanel, position, isExpanded, isRoomView, panelSize.width, panelSize.height, chatListPanelHeightRem]);
  const dateLabel = formatDateLabel(selectedMessages[0]?.createdAt ?? null);
  const isRoomsEmpty = rooms.length === 0;
  const isCreatingRoom = createRoomMutation.isPending;
  const sendingDisabled =
    !hasMessageDraft || isCreatingRoom || (!isDraftChat && activeRoomId <= 0);
  const roomTitle =
    selectedRoom?.otherMember.nickname ?? draftTarget?.nickname ?? '채팅';

  useEffect(() => {
    if (focusRoomId == null) return;
    setIsExpanded(true);
    setSelectedChatId(focusRoomId);
    setDraftTarget(null);
    setPendingFirstMessage(null);
    setMessageDraft('');
    setFailedActionMessageId(null);
    setIsRoomMenuOpen(false);
    setIsLeaveConfirmOpen(false);
    setLeaveErrorMessage(null);
    clearFocusRoom();
  }, [focusRoomId, clearFocusRoom]);

  useEffect(() => {
    if (focusDraft == null) return;
    setIsExpanded(true);
    setSelectedChatId(null);
    setDraftTarget(focusDraft);
    setPendingFirstMessage(null);
    setMessageDraft('');
    setFailedActionMessageId(null);
    setIsRoomMenuOpen(false);
    setIsLeaveConfirmOpen(false);
    setLeaveErrorMessage(null);
    clearFocusDraft();
  }, [focusDraft, clearFocusDraft]);

  // draft 첫 메시지: 방 생성 후 room hook이 준비되면 전송
  useEffect(() => {
    if (pendingFirstMessage == null || activeRoomId <= 0) return;
    const content = pendingFirstMessage;
    setPendingFirstMessage(null);
    void chatRoom.sendMessage(content, { senderClerkId: userId });
    // sendMessage는 roomId 변경 직후 인스턴스 기준으로 한 번만 호출
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingFirstMessage, activeRoomId]);

  useEffect(() => {
    if (failedActionMessageId == null && !isRoomMenuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (failedMenuRef.current?.contains(target)) return;
      if (roomMenuRef.current?.contains(target)) return;
      setFailedActionMessageId(null);
      setIsRoomMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [failedActionMessageId, isRoomMenuOpen]);

  const lastMessageId = selectedMessages.at(-1)?.messageId ?? null;
  useEffect(() => {
    if (activeRoomId <= 0) {
      prevRoomIdForScrollRef.current = null;
      prevLastMessageIdForScrollRef.current = null;
      return;
    }
    if (selectedMessages.length === 0) return;

    const roomChanged = prevRoomIdForScrollRef.current !== activeRoomId;
    const lastChanged = prevLastMessageIdForScrollRef.current !== lastMessageId;
    prevRoomIdForScrollRef.current = activeRoomId;
    prevLastMessageIdForScrollRef.current = lastMessageId;

    // 이전 페이지 prepend로 길이만 늘어난 경우엔 맨 아래로 내리지 않음
    if (!roomChanged && !lastChanged) return;

    const frameId = window.requestAnimationFrame(() => {
      const el = messageListRef.current;
      if (!el) return;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: roomChanged ? 'auto' : 'smooth',
      });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [activeRoomId, lastMessageId, selectedMessages.length]);

  const handleMessageListScroll = () => {
    const el = messageListRef.current;
    if (!el) return;
    if (el.scrollTop > 48) return;
    if (!chatRoom.hasOlderMessages || chatRoom.isFetchingOlderMessages || isLoadingOlderRef.current) {
      return;
    }

    isLoadingOlderRef.current = true;
    const prevHeight = el.scrollHeight;
    const prevTop = el.scrollTop;

    void chatRoom
      .fetchOlderMessages()
      .then(() => {
        window.requestAnimationFrame(() => {
          const list = messageListRef.current;
          if (!list) return;
          list.scrollTop = list.scrollHeight - prevHeight + prevTop;
        });
      })
      .finally(() => {
        isLoadingOlderRef.current = false;
      });
  };

  const widgetSurfaceClassName = cn(
    'overflow-hidden rounded-[1.8rem] border backdrop-blur-[2rem]',
    isLightTheme
      ? 'border-[rgba(212,218,231,0.95)] bg-[rgba(255,255,255,0.98)] shadow-[0_1.2rem_3rem_rgba(15,23,42,0.12)]'
      : 'border-[rgba(127,133,150,0.28)] bg-[rgba(24,26,31,0.97)] shadow-[0_1.2rem_3rem_rgba(0,0,0,0.32)]',
  );
  const headerClassName = 'flex h-[6.8rem] items-center px-[1.6rem] max-[389px]:px-[1.2rem]';
  const iconButtonClassName = cn(
    'flex size-[2.8rem] cursor-pointer items-center justify-center rounded-full transition-colors duration-200',
    isLightTheme
      ? 'text-[var(--ui-500)] hover:bg-[var(--ui-50)]'
      : 'text-[var(--ui-500)] hover:bg-[rgba(255,255,255,0.05)]',
  );
  const datePillClassName = cn(
    'inline-flex rounded-full border px-[0.8rem] py-[0.3rem] text-[1rem] font-medium leading-[1.3]',
    isLightTheme
      ? 'border-[rgba(212,218,231,0.7)] bg-white text-[var(--ui-400)]'
      : 'border-[rgba(127,133,150,0.12)] bg-[rgba(255,255,255,0.025)] text-[var(--ui-400)]',
  );
  const receivedBubbleClassName = cn(
    'rounded-[1.6rem] border px-[1.2rem] py-[0.9rem]',
    isLightTheme
      ? 'border-[rgba(212,218,231,0.7)] bg-[#F7F8FB]'
      : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.075)]',
  );
  const footerClassName = 'px-[1.6rem] py-[1.2rem] max-[389px]:px-[1.2rem]';
  const inputFieldClassName = cn(
    'flex h-[4.4rem] min-w-0 flex-1 items-center rounded-full border px-[1.6rem] max-[389px]:px-[1.2rem]',
    isLightTheme
      ? 'border-[rgba(212,218,231,0.95)] bg-white shadow-[0_0.6rem_1.4rem_rgba(15,23,42,0.05)]'
      : 'border-[rgba(127,133,150,0.16)] bg-[#1B1D23]',
  );
  const listItemClassName = cn(
    'group relative flex w-full cursor-pointer items-start px-[1.2rem] py-[1.6rem] text-left transition-colors max-[389px]:px-[1rem]',
    isLightTheme
      ? 'hover:bg-[rgba(15,23,42,0.025)]'
      : 'hover:bg-[#ffffff05]',
  );
  const messageRows = useMemo(
    () =>
      selectedMessages.map((message) => ({
        ...message,
        isMine: Boolean(userId) && message.senderClerkId === userId,
      })),
    [selectedMessages, userId],
  );

  const closeWidget = () => {
    setIsExpanded(false);
    setSelectedChatId(null);
    setDraftTarget(null);
    setPendingFirstMessage(null);
    setMessageDraft('');
    setFailedActionMessageId(null);
    setIsRoomMenuOpen(false);
    setIsLeaveConfirmOpen(false);
    setLeaveErrorMessage(null);
  };

  const collapseToList = () => {
    setSelectedChatId(null);
    setDraftTarget(null);
    setPendingFirstMessage(null);
    setMessageDraft('');
    setFailedActionMessageId(null);
    setIsRoomMenuOpen(false);
    setIsLeaveConfirmOpen(false);
    setLeaveErrorMessage(null);
    void refetchRooms();
  };

  const openLeaveConfirm = () => {
    setIsRoomMenuOpen(false);
    setLeaveErrorMessage(null);
    setIsLeaveConfirmOpen(true);
  };

  const closeLeaveConfirm = () => {
    if (leaveChatRoomMutation.isPending) return;
    setIsLeaveConfirmOpen(false);
    setLeaveErrorMessage(null);
  };

  const handleConfirmLeave = async () => {
    if (activeRoomId <= 0 || leaveChatRoomMutation.isPending) return;
    setLeaveErrorMessage(null);
    try {
      await leaveChatRoomMutation.mutateAsync({ roomId: activeRoomId });
      setIsLeaveConfirmOpen(false);
      collapseToList();
    } catch {
      setLeaveErrorMessage('채팅방 나가기에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  const handleSend = async () => {
    if (sendingDisabled) return;
    const content = messageDraft.trim();
    if (!content) return;
    setMessageDraft('');
    setFailedActionMessageId(null);

    // 기존 방: 바로 전송
    if (activeRoomId > 0) {
      await chatRoom.sendMessage(content, { senderClerkId: userId });
      return;
    }

    // draft: 첫 전송 때 방 생성 후 메시지 전송
    if (!draftTarget) return;
    try {
      const room = await createRoomMutation.mutateAsync({
        targetClerkId: draftTarget.targetClerkId,
      });
      queryClient.setQueryData<ChatRoomsListData>(CHAT_ROOMS_QUERY_KEY, (prev) => {
        const prevRooms = prev?.rooms ?? [];
        const summary = {
          roomId: room.roomId,
          lastMessage: content,
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
          otherMember: room.otherMember,
        };
        return {
          rooms: [summary, ...prevRooms.filter((r) => r.roomId !== summary.roomId)],
        };
      });
      setPendingFirstMessage(content);
      setDraftTarget(null);
      setSelectedChatId(room.roomId);
    } catch (e) {
      setMessageDraft(content);
      const msg = isChatApiError(e)
        ? e.message
        : e instanceof Error
          ? e.message
          : '채팅방을 열 수 없어요.';
      window.alert(msg);
    }
  };

  const handleRemoveFailed = (messageId: number) => {
    setFailedActionMessageId(null);
    chatRoom.removeFailedMessage(messageId);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[45]">
      <div className="relative mx-auto w-full max-w-[144rem]">
        <section
          ref={widgetRef}
          aria-label="전역 채팅 위젯"
          className={cn(
            'pointer-events-auto fixed left-[2.4rem] transition-none max-[743px]:left-[1.6rem]',
            isExpanded
              ? cn(
                  'bottom-[2rem] max-[389px]:right-[1rem]',
                  canResizePanel && isRoomView ? null : 'w-[31rem] max-[743px]:w-[28.8rem]',
                  'max-[389px]:w-auto',
                  !canResizePanel && isRoomView
                    ? 'h-[45.8rem] max-[743px]:h-[42rem] max-[389px]:h-[40rem]'
                    : null,
                )
              : 'bottom-[2.4rem] h-[4.8rem] w-[15rem] max-[743px]:bottom-[1.6rem] max-[389px]:w-[min(15rem,calc(100vw-2rem))]',
            (isResizing || isDragging) && 'transition-none select-none',
          )}
          style={{
            left: canResizePanel ? position?.left : undefined,
            bottom: canResizePanel ? position?.bottom : undefined,
            width: isExpanded && canResizePanel && isRoomView ? panelSize.width : undefined,
            height: isExpanded
              ? isRoomView
                ? canResizePanel ? panelSize.height : undefined
                : `min(${chatListPanelHeightRem}rem, calc(100dvh - 40px))`
              : undefined,
          }}
        >
          {canResizePanel && isExpanded ? (
            <>
              <div
                aria-hidden
                className="absolute top-0 left-0 z-20 h-[1rem] w-[1rem] cursor-nwse-resize"
                onPointerDown={(event) => beginPanelResize('corner', event)}
              />
              <div
                aria-hidden
                className="absolute top-0 right-[1rem] left-[1rem] z-20 h-[0.6rem] cursor-ns-resize"
                onPointerDown={(event) => beginPanelResize('top', event)}
              />
              <div
                aria-hidden
                className="absolute top-[1rem] bottom-0 left-0 z-20 w-[0.6rem] cursor-ew-resize"
                onPointerDown={(event) => beginPanelResize('left', event)}
              />
            </>
          ) : null}
          {!isExpanded ? (
            <button
              type="button"
              aria-expanded={false}
              aria-controls="global-chat-panel"
              aria-label={
                unreadRoomCount > 0
                  ? `메시지, 안 읽은 채팅방 ${unreadRoomCount}개`
                  : '메시지'
              }
              onPointerDown={beginWidgetDrag}
              onClick={() => {
                if (Date.now() - lastDragEndRef.current < 350) return;
                setIsExpanded(true);
              }}
              style={{ touchAction: canResizePanel ? 'none' : undefined }}
              className={cn(
                'devine-floating-action devine-floating-action-secondary flex h-full w-full items-center gap-[0.8rem] rounded-full border px-[1.4rem] text-left',
                canResizePanel && (isDragging ? 'cursor-grabbing' : 'cursor-grab'),
                isLightTheme
                  ? 'border-[rgba(212,218,231,0.95)] bg-[rgba(255,255,255,0.98)] shadow-[0_0.8rem_2rem_rgba(15,23,42,0.12)] hover:bg-[#F8F9FB]'
                  : 'border-[rgba(166,155,255,0.25)] bg-[#1b1d24] shadow-[0_0.8rem_2rem_rgba(0,0,0,0.25)] hover:bg-[#262834]',
              )}
            >
              <span className="relative flex size-[2rem] shrink-0 items-center justify-center text-[var(--ui-700)]">
                <ChatPaperPlaneIcon aria-hidden="true" className="size-[2rem]" />
                {unreadRoomCount > 0 ? (
                  <span className="absolute -right-[0.7rem] -bottom-[0.7rem] flex size-[1.7rem] items-center justify-center rounded-full bg-[#F04452] text-[1rem] font-bold leading-none text-white" aria-hidden="true">
                    {unreadBadgeLabel}
                  </span>
                ) : null}
              </span>
              <span className="whitespace-nowrap text-[1.4rem] font-semibold text-[var(--ui-900)]">메시지</span>
              <span className="ml-auto flex items-center pl-[0.4rem]">
                {rooms.slice(0, 3).map((room, index) => (
                  <span
                    key={room.roomId}
                    className={cn(
                      'relative flex size-[2.5rem] items-center justify-center overflow-hidden rounded-full border border-[rgba(255,255,255,0.72)] bg-[#77717D] text-[1rem] font-semibold text-white',
                      index > 0 && '-ml-[0.8rem]',
                    )}
                    style={{ zIndex: 3 - index }}
                  >
                    {room.otherMember.image ? (
                      <img src={room.otherMember.image} alt="" className="size-full object-cover" />
                    ) : (
                      room.otherMember.nickname.slice(0, 1)
                    )}
                  </span>
                ))}
                <span className="-ml-[0.7rem] flex size-[2.5rem] items-center justify-center rounded-full bg-[var(--ui-200)] text-[1.3rem] leading-none text-[var(--ui-700)]" aria-hidden="true">
                  ···
                </span>
              </span>
            </button>
          ) : (
            <div id="global-chat-panel" className={cn('chat-widget-panel-enter flex h-full min-h-0 flex-col', widgetSurfaceClassName)}>
              {isRoomView ? (
                <>
                  <div
                    className={cn(headerClassName, canResizePanel && (isDragging ? 'cursor-grabbing select-none' : 'cursor-grab select-none'))}
                    onPointerDown={beginWidgetDrag}
                    style={{ touchAction: canResizePanel ? 'none' : undefined }}
                  >
                    <button
                      type="button"
                      onClick={collapseToList}
                      className={cn(iconButtonClassName, 'size-[2.4rem]')}
                      aria-label="채팅 목록으로 돌아가기"
                    >
                      <ArrowLeftIcon className="size-[1.8rem]" />
                    </button>
                    <ChatAvatar
                      image={selectedRoom?.otherMember.image ?? draftTarget?.image}
                      name={roomTitle}
                      isLightTheme={isLightTheme}
                      className="ml-[0.7rem] size-[3.2rem] text-[1.2rem] max-[389px]:ml-[0.5rem]"
                    />
                    <div className="ml-[1rem] min-w-0 flex-1 max-[389px]:ml-[0.8rem]">
                      <span className="Body1 block truncate font-semibold text-[var(--ui-900)]">
                        {roomTitle}
                      </span>
                    </div>
                    {!isDraftChat ? (
                    <div className="relative mr-[0.2rem]" ref={roomMenuRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setFailedActionMessageId(null);
                          setIsRoomMenuOpen((prev) => !prev);
                        }}
                        className={cn(iconButtonClassName, 'size-[2.4rem]')}
                        aria-label="채팅방 메뉴"
                        aria-expanded={isRoomMenuOpen}
                        aria-haspopup="menu"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="size-[1.6rem]"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="5" r="1.75" />
                          <circle cx="12" cy="12" r="1.75" />
                          <circle cx="12" cy="19" r="1.75" />
                        </svg>
                      </button>
                      {isRoomMenuOpen ? (
                        <div
                          className={cn(
                            'absolute top-[calc(100%+0.6rem)] right-0 z-30 min-w-[15.2rem] rounded-[1.2rem] border p-[0.4rem] shadow-[0_1.2rem_3rem_rgba(0,0,0,0.2)]',
                            isLightTheme
                              ? 'border-[rgba(212,218,231,0.8)] bg-white'
                              : 'border-[rgba(127,133,150,0.24)] bg-[#22242A]',
                          )}
                          role="menu"
                        >
                          <button
                            type="button"
                            role="menuitem"
                            className={cn(
                              'flex w-full items-center gap-[0.9rem] rounded-[0.9rem] px-[1rem] py-[0.9rem] text-left text-[1.25rem] font-medium transition-colors',
                              isLightTheme
                                ? 'text-[#A84350] hover:bg-[#FAF0F1]'
                                : 'text-[#E5A1A9] hover:bg-[rgba(229,161,169,0.1)]',
                            )}
                            onClick={openLeaveConfirm}
                          >
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-[1.6rem] shrink-0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
                              <path d="M14 8l4 4-4 4M18 12H9" />
                            </svg>
                            채팅방 나가기
                          </button>
                        </div>
                      ) : null}
                    </div>
                    ) : (
                      <span className="mr-[0.2rem] size-[2.4rem]" aria-hidden />
                    )}
                    <button
                      type="button"
                      onClick={closeWidget}
                      className={cn(iconButtonClassName, 'size-[2.4rem]')}
                      aria-label="채팅창 닫기"
                    >
                      <CloseIcon className="size-[1.2rem]" />
                    </button>
                  </div>

                  <div className="px-[1.8rem] pt-[0.8rem] pb-[0.3rem] text-center max-[389px]:px-[1.4rem]">
                    <span className={datePillClassName}>{dateLabel}</span>
                  </div>

                  <div
                    ref={messageListRef}
                    onScroll={handleMessageListScroll}
                    className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[1.8rem] pt-[0.3rem] pb-[0.8rem] max-[389px]:px-[1.4rem]"
                  >
                    <div className="flex flex-col gap-[1.6rem]">
                      {chatRoom.isFetchingOlderMessages ? (
                        <p className="py-[0.4rem] text-center text-[1.1rem] text-[var(--ui-400)]">
                          이전 메시지 불러오는 중…
                        </p>
                      ) : null}
                      {messageRows.length === 0 ? (
                        <p className="text-center text-[1.2rem] text-[var(--ui-500)]">
                          {isDraftChat
                            ? '첫 메시지를 보내면 채팅이 시작됩니다.'
                            : '대화를 시작해보세요.'}
                        </p>
                      ) : null}
                      {messageRows.map((message, index) => {
                        const previousMessage = messageRows[index - 1];
                        const nextMessage = messageRows[index + 1];
                        const isSameGroup = (
                          otherMessage: (typeof messageRows)[number] | undefined,
                        ) => {
                          if (!otherMessage || otherMessage.isMine !== message.isMine) return false;
                          if (otherMessage.senderClerkId !== message.senderClerkId) return false;
                          const timeDifference = Math.abs(
                            new Date(message.createdAt).getTime() -
                              new Date(otherMessage.createdAt).getTime(),
                          );
                          return timeDifference <= 5 * 60 * 1000;
                        };
                        const isGroupedWithPrevious = isSameGroup(previousMessage);
                        const isGroupedWithNext = isSameGroup(nextMessage);
                        const showMessageMeta = !isGroupedWithNext || message.localStatus === 'failed';

                        return !message.isMine ? (
                          <div
                            key={message.messageId}
                            className={cn(
                              'flex items-end gap-[0.8rem] max-[389px]:gap-[0.6rem]',
                              isGroupedWithPrevious && 'mt-[-1rem]',
                            )}
                          >
                            {isGroupedWithNext ? (
                              <span className="size-[2.4rem] shrink-0 max-[389px]:size-[2rem]" aria-hidden />
                            ) : (
                              <ChatAvatar
                                image={message.senderImage}
                                name={message.senderNickname}
                                isLightTheme={isLightTheme}
                                className="mb-[1.7rem] size-[2.4rem] text-[1rem] max-[389px]:size-[2rem]"
                              />
                            )}
                            <div className="min-w-0 max-w-[75%]">
                              <div className={cn(
                                receivedBubbleClassName,
                                isGroupedWithPrevious && 'rounded-tl-[0.6rem]',
                                isGroupedWithNext && 'rounded-bl-[0.6rem]',
                              )}>
                                <p className="break-words whitespace-pre-wrap text-[1.2rem] leading-[1.55] tracking-[0.0252em] text-[var(--ui-900)]">
                                  {message.content}
                                </p>
                              </div>
                              {showMessageMeta ? (
                                <p className="mt-[0.4rem] text-[1rem] leading-[1.3] text-[var(--ui-400)]">
                                  {formatTime(message.createdAt)}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ) : (
                          <div
                            key={message.messageId}
                            className={cn('flex justify-end', isGroupedWithPrevious && 'mt-[-1rem]')}
                          >
                            <div className="flex min-w-0 max-w-[75%] flex-col items-end">
                              <div
                                className={cn(
                                  'rounded-[1.6rem] border px-[1.2rem] py-[0.9rem] max-[389px]:px-[1rem]',
                                  isLightTheme
                                    ? 'border-[rgba(112,85,245,0.14)] bg-[#EDEAF6]'
                                    : 'border-[rgba(149,130,198,0.13)] bg-[rgba(108,91,153,0.22)]',
                                  isGroupedWithPrevious && 'rounded-tr-[0.6rem]',
                                  isGroupedWithNext && 'rounded-br-[0.6rem]',
                                  message.localStatus === 'sending' && 'opacity-70',
                                  message.localStatus === 'failed' && 'opacity-90',
                                )}
                              >
                                <p className="break-words whitespace-pre-wrap text-[1.2rem] leading-[1.55] tracking-[0.0252em] text-[var(--ui-900)]">
                                  {message.content}
                                </p>
                              </div>
                              {showMessageMeta ? (
                                <div className="mt-[0.4rem] flex items-center gap-[0.5rem] text-[1rem] leading-[1.3] text-[var(--ui-400)]">
                                  {message.localStatus === 'failed' ? (
                                    <div
                                      className="relative z-20"
                                      ref={failedActionMessageId === message.messageId ? failedMenuRef : undefined}
                                    >
                                      <button
                                        type="button"
                                        aria-label="전송 실패 메뉴"
                                        aria-expanded={failedActionMessageId === message.messageId}
                                        onClick={() => {
                                          setFailedActionMessageId((prev) =>
                                            prev === message.messageId ? null : message.messageId,
                                          );
                                        }}
                                        className="flex size-[1.8rem] items-center justify-center rounded-full bg-[#FF4D4F] text-[1.1rem] font-bold text-white"
                                      >
                                        !
                                      </button>
                                      {failedActionMessageId === message.messageId ? (
                                        <div
                                          className={cn(
                                            'absolute top-[calc(100%+0.6rem)] right-0 z-30 min-w-[9.6rem] overflow-hidden rounded-[1rem] border py-[0.4rem] shadow-[0_1rem_2.4rem_rgba(15,23,42,0.18)]',
                                            isLightTheme
                                              ? 'border-[rgba(212,218,231,0.95)] bg-white'
                                              : 'border-[rgba(127,133,150,0.28)] bg-[rgba(33,35,40,0.98)]',
                                          )}
                                          role="menu"
                                        >
                                          <button
                                            type="button"
                                            role="menuitem"
                                            className="flex w-full px-[1.2rem] py-[0.7rem] text-left text-[1.2rem] font-medium text-[#FF4D4F] hover:bg-[var(--ui-50)]"
                                            onClick={() => handleRemoveFailed(message.messageId)}
                                          >
                                            삭제
                                          </button>
                                        </div>
                                      ) : null}
                                    </div>
                                  ) : message.isRead && message.localStatus !== 'sending' ? (
                                    <span>읽음</span>
                                  ) : null}
                                  <span>{formatTime(message.createdAt)}</span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={footerClassName}>
                    <div className={cn(inputFieldClassName, 'relative w-full pr-[6.4rem] max-[389px]:pr-[6.4rem]')}>
                      <input
                        type="text"
                        value={messageDraft}
                        onChange={(event) => setMessageDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            void handleSend();
                          }
                        }}
                        placeholder={isCreatingRoom ? '채팅방 만드는 중…' : '메시지 입력...'}
                        disabled={isCreatingRoom}
                        className="w-full bg-transparent text-[1.2rem] font-normal text-[var(--ui-900)] placeholder:text-[var(--ui-400)] outline-none"
                      />
                      {hasMessageDraft ? (
                        <button
                          type="button"
                          onClick={() => {
                            void handleSend();
                          }}
                          disabled={sendingDisabled}
                          className={cn(
                            'chat-send-button-enter absolute inset-y-0 right-[0.5rem] my-auto flex h-[3.2rem] w-[5.2rem] cursor-pointer items-center justify-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed',
                            !sendingDisabled
                              ? 'bg-[#4F5FF2] text-white hover:bg-[#4655DF]'
                              : isLightTheme
                                ? 'bg-[var(--ui-100)] text-[var(--ui-400)]'
                                : 'bg-[#25272D] text-[#666A76]',
                          )}
                          aria-label="메시지 전송"
                        >
                          <ChatSendPlaneIcon aria-hidden="true" className="size-[1.9rem]" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={cn(headerClassName, 'h-[5.6rem] px-[1.8rem]', canResizePanel && (isDragging ? 'cursor-grabbing select-none' : 'cursor-grab select-none'))}
                    onPointerDown={beginWidgetDrag}
                    style={{ touchAction: canResizePanel ? 'none' : undefined }}
                  >
                    <span className="Heading2 font-semibold text-[var(--ui-900)]">메시지</span>
                    <span className="ml-[0.7rem] flex min-w-[1.8rem] items-center justify-center rounded-full bg-[var(--ui-100)] px-[0.5rem] py-[0.25rem] text-[1.05rem] font-medium leading-none text-[var(--ui-500)]">
                      {rooms.length > 99 ? '99+' : rooms.length}
                    </span>
                    <span className="flex-1" />
                    <button
                      type="button"
                      onClick={closeWidget}
                      className={cn(iconButtonClassName, 'size-[2.4rem]')}
                      aria-label="메시지 창 닫기"
                    >
                      <CloseIcon className="size-[1.3rem]" />
                    </button>
                  </div>

                  <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[0.8rem] py-[0.8rem] max-[389px]:px-[0.6rem]">
                    <div className={cn('flex flex-col', isRoomsEmpty && 'min-h-full justify-center')}>
                      {isRoomsEmpty ? (
                        <div className="flex flex-col items-center px-[2rem] text-center">
                          <span className="mb-[1.4rem] flex size-[4.8rem] items-center justify-center rounded-full bg-[var(--ui-100)] text-[var(--ui-500)]">
                            <ChatPaperPlaneIcon aria-hidden="true" className="size-[2.2rem]" />
                          </span>
                          <p className="text-[1.4rem] font-semibold text-[var(--ui-900)]">대화를 시작해 보세요.</p>
                          <p className="mt-[0.7rem] text-[1.2rem] leading-[1.6] text-[var(--ui-500)]">
                            프로젝트나 개발자 페이지에서 메시지를 보내면<br />여기에 대화가 표시돼요.
                          </p>
                        </div>
                      ) : null}
                      {rooms.map((room) => {
                        const avatarTone = room.roomId % 3;
                        const preview = room.lastMessage?.trim();
                        const isUnread = room.unreadCount > 0;
                        const lastMessageAge = preview
                          ? formatListLastContactLabel(room.lastMessageAt, relativeTimeNow)
                          : '';
                        return (
                          <button
                            key={room.roomId}
                            type="button"
                            onClick={() => {
                              setSelectedChatId(room.roomId);
                              setMessageDraft('');
                            }}
                            className={cn(
                              listItemClassName,
                              isLightTheme
                                ? 'border-b border-[rgba(15,23,42,0.06)] last:border-b-0'
                                : 'border-b border-[rgba(255,255,255,0.06)] last:border-b-0',
                            )}
                          >
                            <span
                              className={cn(
                                'flex size-[3.8rem] shrink-0 items-center justify-center overflow-hidden rounded-full text-[1.4rem] font-semibold max-[389px]:size-[3.4rem]',
                                isLightTheme
                                  ? ['bg-[#EEE9FF] text-[#6552C9]', 'bg-[#E7E4F2] text-[#6552C9]', 'bg-[#DDD9EC] text-[#6552C9]'][avatarTone]
                                  : ['bg-[#262230] text-[#C5B8E9]', 'bg-[#302B3C] text-[#C5B8E9]', 'bg-[#3A3547] text-[#C5B8E9]'][avatarTone],
                              )}
                            >
                              {room.otherMember.image ? (
                                <img
                                  src={room.otherMember.image}
                                  alt=""
                                  className="size-full object-cover"
                                />
                              ) : (
                                room.otherMember.nickname.slice(0, 1)
                              )}
                            </span>
                            <div className="ml-[1.2rem] flex min-w-0 flex-1 items-start gap-[0.8rem] max-[389px]:ml-[0.8rem] max-[389px]:gap-[0.6rem]">
                              <div className="min-w-0 flex-1">
                                <span className={cn('Label1 block truncate text-[var(--ui-900)]', isUnread ? 'font-semibold' : 'font-medium')}>
                                  <span className="min-w-0 truncate">{room.otherMember.nickname}</span>
                                </span>
                                <div className="mt-[0.5rem] flex min-w-0 items-baseline gap-[0.5rem]">
                                  <p className={cn(
                                    'min-w-0 truncate text-[1.2rem] leading-[1.45] tracking-[0.0252em]',
                                    isUnread
                                      ? isLightTheme ? 'font-medium text-[var(--ui-900)]' : 'font-medium text-white'
                                      : preview ? 'text-[var(--ui-500)]' : 'text-[var(--ui-400)]',
                                  )}>
                                    {preview || '아직 메시지가 없어요'}
                                  </p>
                                  {lastMessageAge ? (
                                    <span className="shrink-0 text-[1rem] leading-[1.4] text-[var(--ui-400)]">
                                      · {lastMessageAge}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                              {isUnread ? (
                                <span className="mt-[0.6rem] size-[0.7rem] shrink-0 rounded-full bg-[#8F7AF7]" aria-label="읽지 않은 메시지 있음" />
                              ) : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </div>

      {isLeaveConfirmOpen
        ? createPortal(
            <div
              className="pointer-events-auto fixed inset-0 z-[70] flex items-center justify-center bg-black/55 px-[1.6rem]"
              role="presentation"
              onClick={closeLeaveConfirm}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="leave-chat-room-title"
                aria-describedby="leave-chat-room-description"
                className={cn(
                  'w-full max-w-[34rem] rounded-[1.8rem] border px-[2.2rem] pt-[2.2rem] pb-[2rem] text-left shadow-[0_2rem_6rem_rgba(0,0,0,0.28)]',
                  isLightTheme
                    ? 'border-[rgba(212,218,231,0.8)] bg-white'
                    : 'border-[rgba(127,133,150,0.24)] bg-[#22242A]',
                )}
                onClick={(event) => event.stopPropagation()}
              >
                <span className={cn(
                  'mb-[1.6rem] flex size-[3.8rem] items-center justify-center rounded-[1.1rem]',
                  isLightTheme ? 'bg-[#FAF0F1] text-[#A84350]' : 'bg-[rgba(229,161,169,0.1)] text-[#E5A1A9]',
                )} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" className="size-[1.9rem]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
                    <path d="M14 8l4 4-4 4M18 12H9" />
                  </svg>
                </span>
                <h2
                  id="leave-chat-room-title"
                  className="text-[1.7rem] font-semibold leading-[1.4] text-[var(--ui-900)]"
                >
                  채팅방을 나가시겠어요?
                </h2>
                <p id="leave-chat-room-description" className="mt-[0.7rem] text-[1.25rem] leading-[1.55] text-[var(--ui-500)]">
                  나가면 이 대화가 채팅 목록에서 사라집니다.
                </p>
                {leaveErrorMessage ? (
                  <p className="mt-[0.8rem] text-[1.2rem] leading-[1.4] text-[#E5A1A9]" role="alert">
                    {leaveErrorMessage}
                  </p>
                ) : null}
                <div className="mt-[2.4rem] flex gap-[0.8rem]">
                  <button
                    type="button"
                    onClick={closeLeaveConfirm}
                    disabled={leaveChatRoomMutation.isPending}
                    className={cn(
                      'h-[4.2rem] flex-1 cursor-pointer rounded-[1rem] border text-[1.3rem] font-medium transition-colors disabled:cursor-default disabled:opacity-60',
                      isLightTheme
                        ? 'border-[rgba(212,218,231,0.8)] text-[var(--ui-700)] hover:bg-[var(--ui-50)]'
                        : 'border-[rgba(127,133,150,0.26)] text-[#D4D4D8] hover:bg-[rgba(255,255,255,0.05)]',
                    )}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleConfirmLeave();
                    }}
                    disabled={leaveChatRoomMutation.isPending}
                    className="h-[4.2rem] flex-1 cursor-pointer rounded-[1rem] bg-[#B84D5C] text-[1.3rem] font-semibold text-white transition-colors hover:bg-[#A84350] disabled:cursor-default disabled:opacity-60"
                  >
                    {leaveChatRoomMutation.isPending ? '나가는 중…' : '나가기'}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};

export default FloatingChatWidget;
