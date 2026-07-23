import ArrowLeftIcon from '@assets/icons/arrow-left.svg?react';
import ArrowDownIcon from '@assets/icons/arrow-down.svg?react';
import ArrowUpIcon from '@assets/icons/arrow-up.svg?react';
import CloseIcon from '@assets/icons/close.svg?react';
import { useChatRoom } from '@hooks/useChatRoom';
import { useChatRooms } from '@hooks/useChatRooms';
import { useUnreadChatRoomCount } from '@hooks/useUnreadChatRoomCount';
import { cn } from '@libs/cn';
import { useChatWidgetStore } from '@store/chatWidget';
import { useThemeStore } from '@store/theme';
import { useAuth } from '@clerk/clerk-react';
import { useEffect, useMemo, useState } from 'react';

const avatarBaseClassName =
  'shrink-0 rounded-full border shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]';

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

const FloatingChatWidget = () => {
  const { theme } = useThemeStore();
  const { userId } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const isLightTheme = theme === 'light';
  const focusRoomId = useChatWidgetStore((s) => s.focusRoomId);
  const clearFocusRoom = useChatWidgetStore((s) => s.clearFocusRoom);

  const { data: roomsData } = useChatRooms({ enabled: isExpanded });
  const { data: unreadData } = useUnreadChatRoomCount({ enabled: isExpanded });
  const rooms = roomsData?.rooms ?? [];
  const selectedRoom = rooms.find((room) => room.roomId === selectedChatId) ?? null;
  const activeRoomId = selectedChatId ?? 0;
  const chatRoom = useChatRoom(activeRoomId, {
    enabled: isExpanded && activeRoomId > 0,
  });
  const selectedMessages = chatRoom.messages;
  const hasMessageDraft = messageDraft.trim().length > 0;
  const unreadRoomCount = unreadData?.unreadRoomCount ?? 0;
  const dateLabel = formatDateLabel(selectedMessages[0]?.createdAt ?? null);
  const isRoomsEmpty = rooms.length === 0;
  const sendingDisabled = !hasMessageDraft || activeRoomId <= 0;

  useEffect(() => {
    if (focusRoomId == null) return;
    setIsExpanded(true);
    setSelectedChatId(focusRoomId);
    setMessageDraft('');
    clearFocusRoom();
  }, [focusRoomId, clearFocusRoom]);

  const avatarClassName = cn(
    avatarBaseClassName,
    isLightTheme
      ? 'border-[rgba(212,218,231,0.95)] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,1)_0%,rgba(243,245,252,1)_38%,rgba(212,218,231,0.96)_100%)]'
      : 'border-[rgba(255,255,255,0.08)] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.22)_0%,rgba(158,166,186,0.18)_18%,rgba(96,102,115,0.95)_100%)]',
  );
  const widgetSurfaceClassName = cn(
    'overflow-hidden rounded-t-[1.8rem] border border-b-0 backdrop-blur-[2rem]',
    isLightTheme
      ? 'border-[rgba(212,218,231,0.95)] bg-[rgba(255,255,255,0.98)] shadow-[0_-1.2rem_3rem_rgba(15,23,42,0.08),0_-0.1rem_0.6rem_rgba(212,218,231,0.35)]'
      : 'border-[rgba(127,133,150,0.28)] bg-[rgba(33,35,40,0.92)] shadow-[0_-1.8rem_4rem_rgba(0,0,0,0.28),0_-0.1rem_0.73rem_rgba(127,133,150,0.16)]',
  );
  const headerClassName = cn(
    'flex h-[6.8rem] items-center border-b px-[1.6rem] max-[389px]:px-[1.2rem]',
    isLightTheme
      ? 'border-[rgba(212,218,231,0.95)] bg-[rgba(248,249,251,0.96)]'
      : 'border-[rgba(127,133,150,0.18)] bg-[rgba(255,255,255,0.02)]',
  );
  const iconButtonClassName = cn(
    'flex size-[2.8rem] cursor-pointer items-center justify-center rounded-full transition-colors duration-200',
    isLightTheme
      ? 'text-[var(--ui-500)] hover:bg-[var(--ui-50)]'
      : 'text-[var(--ui-500)] hover:bg-[rgba(255,255,255,0.05)]',
  );
  const datePillClassName = cn(
    'inline-flex rounded-full border px-[1rem] py-[0.4rem] text-[1.1rem] font-medium leading-[1.334] tracking-[0.02em]',
    isLightTheme
      ? 'border-[rgba(212,218,231,0.95)] bg-white text-[var(--ui-500)]'
      : 'border-[rgba(127,133,150,0.18)] bg-[rgba(255,255,255,0.04)] text-[var(--ui-400)]',
  );
  const receivedBubbleClassName = cn(
    'rounded-[1.6rem] rounded-bl-[0.6rem] border px-[1.2rem] py-[0.9rem]',
    isLightTheme
      ? 'border-[rgba(212,218,231,0.95)] bg-white shadow-[0_0.8rem_1.8rem_rgba(15,23,42,0.06)]'
      : 'border-[rgba(127,133,150,0.12)] bg-[rgba(255,255,255,0.05)] shadow-[0_0.8rem_1.8rem_rgba(0,0,0,0.12)]',
  );
  const footerClassName = cn(
    'border-t px-[1.6rem] py-[1.4rem] max-[389px]:px-[1.2rem] max-[389px]:py-[1.2rem]',
    isLightTheme
      ? 'border-[rgba(212,218,231,0.95)] bg-[rgba(248,249,251,0.96)]'
      : 'border-[rgba(127,133,150,0.18)] bg-[rgba(255,255,255,0.02)]',
  );
  const inputFieldClassName = cn(
    'flex h-[4rem] min-w-0 flex-1 items-center rounded-full border px-[1.6rem] max-[389px]:px-[1.2rem]',
    isLightTheme
      ? 'border-[rgba(212,218,231,0.95)] bg-white shadow-[0_0.6rem_1.4rem_rgba(15,23,42,0.05)]'
      : 'border-[rgba(127,133,150,0.16)] bg-[rgba(25,27,30,0.95)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
  );
  const listItemClassName = cn(
    'group relative flex h-[7.8rem] w-full items-start rounded-[1.4rem] px-[1.2rem] pt-[1.1rem] text-left max-[389px]:h-[7.2rem] max-[389px]:px-[1rem] max-[389px]:pt-[1rem]',
    isLightTheme ? 'bg-white hover:bg-[var(--ui-50)]' : 'bg-[var(--ui-50)] hover:bg-[var(--ui-100)]',
  );
  const listDividerClassName = cn(
    'absolute right-[1.2rem] bottom-0 h-px w-[calc(100%-2.4rem)] max-[389px]:right-[1rem] max-[389px]:w-[calc(100%-2rem)]',
    isLightTheme
      ? 'bg-[linear-gradient(90deg,rgba(212,218,231,0)_0%,rgba(212,218,231,0.95)_18%,rgba(212,218,231,0.95)_82%,rgba(212,218,231,0)_100%)]'
      : 'bg-[linear-gradient(90deg,rgba(127,133,150,0)_0%,rgba(127,133,150,0.24)_18%,rgba(127,133,150,0.24)_82%,rgba(127,133,150,0)_100%)]',
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
    setMessageDraft('');
  };

  const collapseToList = () => {
    setSelectedChatId(null);
    setMessageDraft('');
  };

  const handleSend = async () => {
    if (sendingDisabled) return;
    const draft = messageDraft;
    setMessageDraft('');
    await chatRoom.sendMessage(draft, {
      senderClerkId: userId,
    });
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[45]">
      <div className="relative mx-auto w-full max-w-[144rem]">
        <section
          aria-label="전역 채팅 위젯"
          className={cn(
            'pointer-events-auto fixed right-[1rem] bottom-0 w-[31rem] transition-[height,width,right,left,transform,box-shadow] duration-300 ease-out max-[743px]:right-[1rem] max-[743px]:w-[28.8rem] max-[389px]:right-[1rem] max-[389px]:left-[1rem] max-[389px]:w-auto',
            isExpanded ? 'h-[45.8rem] max-[743px]:h-[42rem] max-[389px]:h-[40rem]' : 'h-[6.8rem]',
          )}
        >
          {!isExpanded ? (
            <button
              type="button"
              aria-expanded={false}
              aria-controls="global-chat-panel"
              onClick={() => setIsExpanded(true)}
              className={cn(
                'flex h-full w-full items-center px-[1.8rem] text-left max-[389px]:px-[1.4rem]',
                isLightTheme ? 'hover:bg-[rgba(248,249,251,0.96)]' : 'hover:bg-[rgba(255,255,255,0.03)]',
                widgetSurfaceClassName,
              )}
            >
              <span className="Heading2 flex-1 font-semibold text-[var(--ui-900)]">메시지</span>
              {unreadRoomCount > 0 ? (
                <span className="mr-[0.6rem] rounded-full bg-[var(--color-primary)] px-[0.8rem] py-[0.2rem] text-[1.1rem] font-semibold text-white">
                  {unreadRoomCount}
                </span>
              ) : null}
              <span
                className="mr-[0.2rem] flex size-[2.8rem] items-center justify-center text-[var(--ui-500)]"
              >
                <ArrowUpIcon className="size-[2rem]" />
              </span>
            </button>
          ) : (
            <div id="global-chat-panel" className={cn('flex h-full min-h-0 flex-col', widgetSurfaceClassName)}>
              {activeRoomId > 0 ? (
                <>
                  <div className={headerClassName}>
                    <button
                      type="button"
                      onClick={collapseToList}
                      className={iconButtonClassName}
                      aria-label="채팅 목록으로 돌아가기"
                    >
                      <ArrowLeftIcon className="size-[2.4rem] max-[389px]:size-[2.2rem]" />
                    </button>
                    <span
                      className={cn(
                        'ml-[0.8rem] size-[3.6rem] max-[389px]:ml-[0.6rem] max-[389px]:size-[3.2rem]',
                        avatarClassName,
                      )}
                    />
                    <div className="ml-[1.2rem] min-w-0 flex-1 max-[389px]:ml-[0.8rem]">
                      <span className="Body1 block truncate font-semibold text-[var(--ui-900)]">
                        {selectedRoom?.otherMember.nickname ?? '채팅'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={closeWidget}
                      className={iconButtonClassName}
                      aria-label="채팅창 닫기"
                    >
                      <CloseIcon className="size-[1.4rem]" />
                    </button>
                  </div>

                  <div className="px-[1.6rem] py-[1rem] text-center max-[389px]:px-[1.2rem]">
                    <span className={datePillClassName}>{dateLabel}</span>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-[1.6rem] py-[0.6rem] max-[389px]:px-[1.2rem]">
                    <div className="flex flex-col gap-[1.6rem]">
                      {messageRows.length === 0 ? (
                        <p className="text-center text-[1.2rem] text-[var(--ui-500)]">대화를 시작해보세요.</p>
                      ) : null}
                      {messageRows.map((message) =>
                        !message.isMine ? (
                          <div key={message.messageId} className="flex items-end gap-[0.8rem] max-[389px]:gap-[0.6rem]">
                            <span
                              className={cn('mb-[0.2rem] size-[2.4rem] max-[389px]:size-[2rem]', avatarClassName)}
                            />
                            <div className="min-w-0 max-w-[70%] max-[389px]:max-w-[68%]">
                              <p className="Caption1 mb-[0.6rem] font-medium text-[var(--ui-500)]">
                                {message.senderNickname}
                              </p>
                              <div className={receivedBubbleClassName}>
                                <p className="text-[1.2rem] leading-[1.55] tracking-[0.0252em] text-[var(--ui-900)]">
                                  {message.content}
                                </p>
                              </div>
                            </div>
                            <span className="shrink-0 pb-[0.2rem] text-[1rem] leading-[1.334] tracking-[-0.02em] text-[var(--ui-400)]">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                        ) : (
                          <div key={message.messageId} className="flex justify-end">
                            <div className="flex max-w-[82%] items-end gap-[0.6rem] max-[389px]:max-w-[86%] max-[389px]:gap-[0.5rem]">
                              <span className="shrink-0 pb-[0.2rem] text-[1rem] leading-[1.334] tracking-[-0.02em] text-[var(--ui-400)]">
                                {formatTime(message.createdAt)}
                              </span>
                              <div className="rounded-[1.6rem] rounded-br-[0.6rem] bg-[linear-gradient(135deg,#5B56FF_0%,#4E49FF_58%,#7C79FF_100%)] px-[1.2rem] py-[0.9rem] max-[389px]:px-[1rem] shadow-[0_1.2rem_2.4rem_rgba(78,73,255,0.22)]">
                                <p className="text-[1.2rem] leading-[1.55] tracking-[0.0252em] text-white">
                                  {message.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className={footerClassName}>
                    <div className="flex items-center gap-[0.8rem] max-[389px]:gap-[0.6rem]">
                      <div className={inputFieldClassName}>
                        <input
                          type="text"
                          value={messageDraft}
                          onChange={(event) => setMessageDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              void handleSend();
                            }
                          }}
                          placeholder="메시지 보내기"
                          className="Label1 w-full bg-transparent font-medium text-[var(--ui-900)] placeholder:text-[var(--ui-400)] outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          void handleSend();
                        }}
                        disabled={sendingDisabled}
                        className={cn(
                          'flex size-[3rem] cursor-pointer items-center justify-center rounded-full transition-[transform,box-shadow] duration-200 max-[389px]:size-[2.8rem] disabled:cursor-default',
                          !sendingDisabled
                            ? 'bg-[var(--color-primary)] text-[var(--ui-50)] shadow-[0_1rem_2rem_rgba(78,73,255,0.28)] hover:scale-[1.03]'
                            : 'bg-[var(--ui-200)] text-[var(--ui-50)] shadow-none',
                        )}
                        aria-label="메시지 전송"
                      >
                        <svg
                          viewBox="10 9 12 13"
                          className="size-[1.7rem] max-[389px]:size-[1.6rem]"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M20.7075 15.7075C20.6146 15.8005 20.5043 15.8742 20.3829 15.9246C20.2615 15.9749 20.1314 16.0008 20 16.0008C19.8686 16.0008 19.7385 15.9749 19.6171 15.9246C19.4957 15.8742 19.3854 15.8005 19.2925 15.7075L17 13.4137V21C17 21.2652 16.8946 21.5196 16.7071 21.7071C16.5196 21.8946 16.2652 22 16 22C15.7348 22 15.4804 21.8946 15.2929 21.7071C15.1054 21.5196 15 21.2652 15 21V13.4137L12.7075 15.7075C12.5199 15.8951 12.2654 16.0006 12 16.0006C11.7346 16.0006 11.4801 15.8951 11.2925 15.7075C11.1049 15.5199 10.9994 15.2654 10.9994 15C10.9994 14.7346 11.1049 14.4801 11.2925 14.2925L15.2925 10.2925C15.3854 10.1995 15.4957 10.1258 15.6171 10.0754C15.7385 10.0251 15.8686 9.99921 16 9.99921C16.1314 9.99921 16.2615 10.0251 16.3829 10.0754C16.5043 10.1258 16.6146 10.1995 16.7075 10.2925L20.7075 14.2925C20.8005 14.3854 20.8742 14.4957 20.9246 14.6171C20.9749 14.7385 21.0008 14.8686 21.0008 15C21.0008 15.1314 20.9749 15.2615 20.9246 15.3829C20.8742 15.5043 20.8005 15.6146 20.7075 15.7075Z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={cn(headerClassName, 'px-[1.8rem]')}>
                    <span className="Heading2 flex-1 font-semibold text-[var(--ui-900)]">메시지</span>
                    <button
                      type="button"
                      onClick={closeWidget}
                      className={iconButtonClassName}
                      aria-label="채팅 목록 접기"
                    >
                      <ArrowDownIcon className="size-[2rem]" />
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-[0.8rem] py-[0.8rem] max-[389px]:px-[0.6rem]">
                    <div className="flex flex-col gap-[0.2rem]">
                      {isRoomsEmpty ? (
                        <p className="py-[2.4rem] text-center text-[1.2rem] text-[var(--ui-500)]">
                          참여 중인 채팅방이 없습니다.
                        </p>
                      ) : null}
                      {rooms.map((room) => (
                        <button
                          key={room.roomId}
                          type="button"
                          onClick={() => {
                            setSelectedChatId(room.roomId);
                            setMessageDraft('');
                          }}
                          className={listItemClassName}
                        >
                          <span
                            className={cn(
                              'size-[3.8rem] transition-transform duration-200 group-hover:scale-[1.03] max-[389px]:size-[3.4rem]',
                              avatarClassName,
                            )}
                          />
                          <div className="ml-[1.2rem] min-w-0 flex-1 pr-[4rem] max-[389px]:ml-[0.8rem] max-[389px]:pr-[3.6rem]">
                            <div className="flex items-start gap-[0.8rem] max-[389px]:gap-[0.6rem]">
                              <span className="Label1 min-w-0 truncate font-semibold text-[var(--ui-900)]">
                                {room.otherMember.nickname}
                              </span>
                              <span className="ml-auto shrink-0 text-right text-[1.3rem] leading-[1.429] tracking-[0.0145em] text-[var(--ui-600)] max-[389px]:text-[1.2rem]">
                                {formatDateLabel(room.lastMessageAt)}
                              </span>
                            </div>
                            <p className="mt-[0.5rem] line-clamp-2 text-[1.2rem] leading-[1.45] tracking-[0.0252em] text-[var(--ui-500)]">
                              {room.lastMessage ?? '메시지가 없습니다.'}
                            </p>
                          </div>
                          {room.unreadCount > 0 ? (
                            <span className="absolute top-[3.8rem] right-[1.2rem] flex min-w-[2rem] items-center justify-center rounded-full bg-[linear-gradient(135deg,#5B56FF_0%,#4E49FF_100%)] px-[0.7rem] py-[0.2rem] text-[1.1rem] font-semibold leading-[1.334] tracking-[0.02em] text-white shadow-[0_0.8rem_1.6rem_rgba(78,73,255,0.25)] max-[389px]:top-[3.5rem] max-[389px]:right-[1rem]">
                              {room.unreadCount}
                            </span>
                          ) : (
                            <span
                              className={cn(
                                'absolute top-[1.8rem] right-[1.4rem] size-[0.7rem] rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 max-[389px]:top-[1.7rem] max-[389px]:right-[1.1rem]',
                                isLightTheme
                                  ? 'bg-[rgba(158,166,186,0.6)]'
                                  : 'bg-[rgba(127,133,150,0.35)]',
                              )}
                            />
                          )}
                          <span className={listDividerClassName} />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FloatingChatWidget;
