import ChatAvatar from './chat-avatar';
import ChatPaperPlaneIcon from '@assets/icons/chat-paper-plane.svg?react';
import ChatRoomList from './chat-room-list';
import ChatMessageList from './chat-message-list';
import { formatDateLabel } from './chat-format';
import { useChatPanelGeometry } from './use-chat-panel-geometry';
import ArrowLeftIcon from '@assets/icons/arrow-left.svg?react';
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
import type { ChatRoomsListData } from '@t/chat';
import { useAuth } from '@clerk/clerk-react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './floating-chat-widget.css';

const FloatingChatWidget = () => {
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
  const failedMenuRef = useRef<HTMLDivElement | null>(null);
  const roomMenuRef = useRef<HTMLDivElement | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const prevRoomIdForScrollRef = useRef<number | null>(null);
  const prevLastMessageIdForScrollRef = useRef<number | null>(null);
  const isLoadingOlderRef = useRef(false);
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
  const { panelSize, isResizing, position, isDragging, widgetRef, lastDragEndRef, canResizePanel, beginWidgetDrag, beginPanelResize } = useChatPanelGeometry(isExpanded, isRoomView, chatListPanelHeightRem);
  useEffect(() => {
    if (!isExpanded || isRoomView) return;
    setRelativeTimeNow(Date.now());
    const interval = window.setInterval(() => setRelativeTimeNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, [isExpanded, isRoomView]);
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
    'border-[rgba(127,133,150,0.28)] bg-[rgba(24,26,31,0.97)] shadow-[0_1.2rem_3rem_rgba(0,0,0,0.32)]',
  );
  const headerClassName = 'flex h-[6.8rem] items-center px-[1.6rem] max-[389px]:px-[1.2rem]';
  const iconButtonClassName = cn(
    'flex size-[2.8rem] cursor-pointer items-center justify-center rounded-full transition-colors duration-200',
    'text-[var(--ui-500)] hover:bg-[rgba(255,255,255,0.05)]',
  );
  const datePillClassName = cn(
    'inline-flex rounded-full border px-[0.8rem] py-[0.3rem] text-[1rem] font-medium leading-[1.3]',
    'border-[rgba(127,133,150,0.12)] bg-[rgba(255,255,255,0.025)] text-[var(--ui-400)]',
  );
  const receivedBubbleClassName = cn(
    'rounded-[1.6rem] border px-[1.2rem] py-[0.9rem]',
    'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.075)]',
  );
  const footerClassName = 'px-[1.6rem] py-[1.2rem] max-[389px]:px-[1.2rem]';
  const inputFieldClassName = cn(
    'flex h-[4.4rem] min-w-0 flex-1 items-center rounded-full border px-[1.6rem] max-[389px]:px-[1.2rem]',
    'border-[rgba(127,133,150,0.16)] bg-[#1B1D23]',
  );
  const listItemClassName = cn(
    'group relative flex w-full cursor-pointer items-start px-[1.2rem] py-[1.6rem] text-left transition-colors max-[389px]:px-[1rem]',
    'hover:bg-[#ffffff05]',
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
                'border-[rgba(166,155,255,0.25)] bg-[#1b1d24] shadow-[0_0.8rem_2rem_rgba(0,0,0,0.25)] hover:bg-[#262834]',
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
                            'border-[rgba(127,133,150,0.24)] bg-[#22242A]',
                          )}
                          role="menu"
                        >
                          <button
                            type="button"
                            role="menuitem"
                            className={cn(
                              'flex w-full items-center gap-[0.9rem] rounded-[0.9rem] px-[1rem] py-[0.9rem] text-left text-[1.25rem] font-medium transition-colors',
                              'text-[#E5A1A9] hover:bg-[rgba(229,161,169,0.1)]',
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

<ChatMessageList messageListRef={messageListRef} failedMenuRef={failedMenuRef} handleMessageListScroll={handleMessageListScroll}
 messageRows={messageRows} isFetchingOlderMessages={chatRoom.isFetchingOlderMessages} isDraftChat={isDraftChat}
 receivedBubbleClassName={receivedBubbleClassName} failedActionMessageId={failedActionMessageId}
 setFailedActionMessageId={setFailedActionMessageId} handleRemoveFailed={handleRemoveFailed} />
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
<ChatRoomList rooms={rooms} relativeTimeNow={relativeTimeNow} isRoomsEmpty={isRoomsEmpty}
 headerClassName={headerClassName} iconButtonClassName={iconButtonClassName} listItemClassName={listItemClassName}
 canResizePanel={canResizePanel} isDragging={isDragging} beginWidgetDrag={beginWidgetDrag} closeWidget={closeWidget}
 onSelectRoom={(roomId) => { setSelectedChatId(roomId); setMessageDraft(''); }} />
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
                  'border-[rgba(127,133,150,0.24)] bg-[#22242A]',
                )}
                onClick={(event) => event.stopPropagation()}
              >
                <span className={cn(
                  'mb-[1.6rem] flex size-[3.8rem] items-center justify-center rounded-[1.1rem]',
                  'bg-[rgba(229,161,169,0.1)] text-[#E5A1A9]',
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
                      'border-[rgba(127,133,150,0.26)] text-[#D4D4D8] hover:bg-[rgba(255,255,255,0.05)]',
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
