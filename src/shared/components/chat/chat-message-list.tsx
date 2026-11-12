import { cn } from '@libs/cn';
import type { useChatRoom } from '@hooks/useChatRoom';
import type { Dispatch, SetStateAction, RefObject, UIEventHandler } from 'react';
import ChatAvatar from './chat-avatar';
import { formatTime } from './chat-format';
type Props = {
  messageListRef: RefObject<HTMLDivElement | null>;
  failedMenuRef: RefObject<HTMLDivElement | null>;
  handleMessageListScroll: UIEventHandler<HTMLDivElement>;
  messageRows: (ReturnType<typeof useChatRoom>['messages'][number] & { isMine: boolean })[];
  isFetchingOlderMessages: boolean;
  isDraftChat: boolean;
  receivedBubbleClassName: string;
  failedActionMessageId: number | null;
  setFailedActionMessageId: Dispatch<SetStateAction<number | null>>;
  handleRemoveFailed: (messageId: number) => void;
};
export default function ChatMessageList({
  messageListRef,
  failedMenuRef,
  handleMessageListScroll,
  messageRows,
  isFetchingOlderMessages,
  isDraftChat,
  receivedBubbleClassName,
  failedActionMessageId,
  setFailedActionMessageId,
  handleRemoveFailed,
}: Props) {
  return (
    <div
      ref={messageListRef}
      onScroll={handleMessageListScroll}
      className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[1.8rem] pt-[0.3rem] pb-[0.8rem] max-[389px]:px-[1.4rem]"
    >
      <div className="flex flex-col gap-[1.6rem]">
        {isFetchingOlderMessages ? (
          <p className="py-[0.4rem] text-center text-[1.1rem] text-[var(--ui-400)]">
            이전 메시지 불러오는 중…
          </p>
        ) : null}
        {messageRows.length === 0 ? (
          <p className="text-center text-[1.2rem] text-[var(--ui-500)]">
            {isDraftChat ? '첫 메시지를 보내면 채팅이 시작됩니다.' : '대화를 시작해보세요.'}
          </p>
        ) : null}
        {messageRows.map((message, index) => {
          const previousMessage = messageRows[index - 1];
          const nextMessage = messageRows[index + 1];
          const isSameGroup = (otherMessage: (typeof messageRows)[number] | undefined) => {
            if (!otherMessage || otherMessage.isMine !== message.isMine) return false;
            if (otherMessage.senderClerkId !== message.senderClerkId) return false;
            const timeDifference = Math.abs(
              new Date(message.createdAt).getTime() - new Date(otherMessage.createdAt).getTime(),
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
                  className="mb-[1.7rem] size-[2.4rem] text-[1rem] max-[389px]:size-[2rem]"
                />
              )}
              <div className="min-w-0 max-w-[75%]">
                <div
                  className={cn(
                    receivedBubbleClassName,
                    isGroupedWithPrevious && 'rounded-tl-[0.6rem]',
                    isGroupedWithNext && 'rounded-bl-[0.6rem]',
                  )}
                >
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
                    'border-[rgba(149,130,198,0.13)] bg-[rgba(108,91,153,0.22)]',
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
                        ref={
                          failedActionMessageId === message.messageId ? failedMenuRef : undefined
                        }
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
                              'border-[rgba(127,133,150,0.28)] bg-[rgba(33,35,40,0.98)]',
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
  );
}
