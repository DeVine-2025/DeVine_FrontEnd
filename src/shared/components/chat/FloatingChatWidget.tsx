import ArrowLeftIcon from '@assets/icons/arrow-left.svg?react';
import ArrowDownIcon from '@assets/icons/arrow-down.svg?react';
import ArrowUpIcon from '@assets/icons/arrow-up.svg?react';
import CloseIcon from '@assets/icons/close.svg?react';
import { cn } from '@libs/cn';
import { useState } from 'react';

type ChatRoom = {
  id: string;
  name: string;
  preview: string;
  timeLabel: string;
  unreadCount?: number;
};

type ChatMessage = {
  id: string;
  type: 'received' | 'sent';
  sender?: string;
  time: string;
  text: string;
};

const chatRooms: ChatRoom[] = [
  {
    id: 'pm-1',
    name: '닉네임',
    preview: '메세지 내용이 들어가는 자리입니다. 메세지 내용이 들어가는 자리입니다.',
    timeLabel: '1일 전',
    unreadCount: 3,
  },
  {
    id: 'dev-1',
    name: '닉네임',
    preview: '메세지 내용이 들어가는 자리입니다. 메세지 내용이 들어가는 자리입니다.',
    timeLabel: '3월 23일',
  },
];

const chatMessages: Record<string, { dateLabel: string; messages: ChatMessage[] }> = {
  'pm-1': {
    dateLabel: '3월 23일 (월)',
    messages: [
      {
        id: 'm1',
        type: 'received',
        sender: '닉네임',
        time: '08:23',
        text: '메세지 내용이 들어가는 자리입니다. 메세지 내용이 들어가는 자리입니다.',
      },
      {
        id: 'm2',
        type: 'sent',
        time: '08:23',
        text: '메세지 내용이 들어가는 자리입니다. 메세지 내용이 들어가는 자리입니다.메세지 내용이 들어가는 자리입니다.메세지..',
      },
    ],
  },
  'dev-1': {
    dateLabel: '3월 23일 (월)',
    messages: [
      {
        id: 'm3',
        type: 'received',
        sender: '닉네임',
        time: '08:23',
        text: '메세지 내용이 들어가는 자리입니다. 메세지 내용이 들어가는 자리입니다.',
      },
    ],
  },
};

const avatarClassName =
  'shrink-0 rounded-full border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,#6B7280_0%,#4B5563_100%)]';

const FloatingChatWidget = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const selectedRoom = chatRooms.find((room) => room.id === selectedChatId) ?? null;
  const selectedChat = selectedChatId ? chatMessages[selectedChatId] : null;

  const closeWidget = () => {
    setIsExpanded(false);
    setSelectedChatId(null);
  };

  const collapseToList = () => {
    setSelectedChatId(null);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[45]">
      <div className="relative mx-auto w-full max-w-[144rem]">
        <section
          aria-label="전역 채팅 위젯"
          className={cn(
            'pointer-events-auto absolute right-[8rem] bottom-0 w-[30.9rem] overflow-hidden rounded-t-[1.6rem] border border-b-0 border-[var(--ui-200)] bg-[var(--ui-50)] shadow-[0_-0.1rem_0.73rem_rgba(127,133,150,0.15)] transition-[height,width,right,left] duration-300 ease-out max-[743px]:right-[2.4rem] max-[743px]:w-[28rem] max-[389px]:right-[1.6rem] max-[389px]:left-[1.6rem] max-[389px]:w-auto',
            isExpanded ? 'h-[45.8rem] max-[743px]:h-[42rem] max-[389px]:h-[40rem]' : 'h-[6.8rem]',
          )}
        >
          {!isExpanded ? (
            <button
              type="button"
              aria-expanded={false}
              aria-controls="global-chat-panel"
              onClick={() => setIsExpanded(true)}
              className="flex h-full w-full items-center px-[1.6rem] text-left"
            >
              <span className="Heading2 flex-1 font-semibold text-[var(--ui-1000)]">
                메세지
              </span>
              <span className="flex size-[2.4rem] items-center justify-center text-[var(--ui-400)]">
                <ArrowUpIcon className="size-[2.4rem]" />
              </span>
            </button>
          ) : (
            <div id="global-chat-panel" className="flex h-full min-h-0 flex-col">
              {selectedRoom && selectedChat ? (
                <>
                  <div className="flex h-[6.8rem] items-center border-b border-[var(--ui-200)] px-[1.6rem]">
                    <button
                      type="button"
                      onClick={collapseToList}
                      className="flex size-[2.4rem] items-center justify-center text-[var(--ui-500)]"
                      aria-label="채팅 목록으로 돌아가기"
                    >
                      <ArrowLeftIcon className="size-[2.4rem]" />
                    </button>
                    <span className={cn('ml-[0.7rem] size-[3.6rem]', avatarClassName)} />
                    <span className="Body1 ml-[1.2rem] flex-1 font-semibold text-[var(--ui-1000)]">
                      닉네임
                    </span>
                    <button
                      type="button"
                      onClick={closeWidget}
                      className="flex size-[2.4rem] items-center justify-center text-[var(--ui-500)]"
                      aria-label="채팅창 닫기"
                    >
                      <CloseIcon className="size-[1.4rem]" />
                    </button>
                  </div>

                  <div className=" py-[1.2rem] text-center">
                    <span className="Caption1 text-[var(--ui-400)]">{selectedChat.dateLabel}</span>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-[1.6rem] py-[0.8rem]">
                    <div className="flex flex-col gap-[1.6rem]">
                      {selectedChat.messages.map((message) =>
                        message.type === 'received' ? (
                          <div key={message.id} className="flex items-start gap-[0.6rem]">
                            <span className={cn('mt-[0.8rem] size-[2.4rem]', avatarClassName)} />
                            <div className="max-w-[21.8rem]">
                              <p className="Caption1 mb-[0.8rem] font-medium text-[var(--ui-600)]">
                                {message.sender}
                              </p>
                              <div className="rounded-[1.2rem] bg-[var(--ui-100)] px-[1.2rem] py-[0.8rem]">
                                <p className="text-[1.2rem] leading-[1.334] tracking-[0.0252em] text-[var(--ui-1000)]">
                                  {message.text}
                                </p>
                              </div>
                            </div>
                            <span className="self-end pb-[0.1rem] text-[1rem] leading-[1.334] tracking-[-0.02em] text-[var(--ui-400)]">
                              {message.time}
                            </span>
                          </div>
                        ) : (
                          <div key={message.id} className="flex justify-end">
                            <div className="flex max-w-[25.7rem] items-end gap-[0.4rem]">
                              <span className="pb-[0.1rem] text-[1rem] leading-[1.334] tracking-[-0.02em] text-[var(--ui-400)]">
                                {message.time}
                              </span>
                              <div className="rounded-[1.2rem] bg-[#4E49FF] px-[1.2rem] py-[0.8rem]">
                                <p className="text-[1.2rem] leading-[1.334] tracking-[0.0252em] text-white">
                                  {message.text}
                                </p>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="border-t border-[var(--ui-200)] bg-[var(--ui-50)] px-[1.6rem] py-[1.5rem]">
                    <div className="flex items-center gap-[0.8rem]">
                      <div className="flex h-[3.2rem] flex-1 items-center rounded-[2rem] bg-[var(--ui-bg)] px-[1.6rem]">
                        <span className="Label1 font-semibold text-[#AAAAAA]">메세지 보내기</span>
                      </div>
                      <button
                        type="button"
                        className="flex size-[3.2rem] items-center justify-center rounded-full bg-[var(--ui-100)] text-[var(--ui-400)]"
                        aria-label="메시지 전송"
                      >
                        <svg viewBox="0 0 24 24" className="size-[2rem]" fill="none">
                          <path
                            d="M12 5v14m0-14 6 6m-6-6-6 6"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-[6.8rem] items-center border-b border-[var(--ui-200)] px-[1.6rem]">
                    <span className="Heading2 flex-1 font-semibold text-[var(--ui-1000)]">
                      메세지
                    </span>
                    <button
                      type="button"
                      onClick={closeWidget}
                      className="flex size-[2.4rem] items-center justify-center text-[var(--ui-400)]"
                      aria-label="채팅 목록 접기"
                    >
                      <ArrowDownIcon className="size-[2.4rem]" />
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto">
                    {chatRooms.map((room) => (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => setSelectedChatId(room.id)}
                        className="relative flex h-[7.2rem] w-full items-start px-[1.5rem] pt-[0.8rem] text-left"
                      >
                        <span className={cn('mt-0 size-[3.6rem]', avatarClassName)} />
                        <div className="ml-[1.2rem] min-w-0 flex-1">
                          <div className="flex items-start">
                            <span className="Label1 font-semibold text-[var(--ui-900)]">
                              {room.name}
                            </span>
                            <span className="ml-auto text-right text-[1.4rem] leading-[1.429] tracking-[0.0145em] text-[var(--ui-700)]">
                              {room.timeLabel}
                            </span>
                          </div>
                          <p className="mt-[0.4rem] w-[17.6rem] text-[1.2rem] leading-[1.334] tracking-[0.0252em] text-[var(--ui-500)]">
                            {room.preview}
                          </p>
                        </div>
                        {room.unreadCount ? (
                          <span className="absolute top-[3.7rem] right-[1.5rem] flex h-[2.2rem] w-[2.4rem] items-center justify-center rounded-full bg-[#4E49FF] text-[1.2rem] leading-[1.334] font-semibold tracking-[0.0252em] text-white">
                            {room.unreadCount}
                          </span>
                        ) : null}
                        <span className="absolute right-[1.6rem] bottom-0 h-px w-[27.7rem] bg-[var(--ui-100)]" />
                      </button>
                    ))}
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
