import CloseIcon from '@assets/icons/close.svg?react';
import ChatPaperPlaneIcon from '@assets/icons/chat-paper-plane.svg?react';
import { cn } from '@libs/cn';
import type { ChatRoomsListData } from '@t/chat';
import type { PointerEventHandler } from 'react';
import { formatListLastContactLabel } from './chat-format';
type Props = {
  rooms: ChatRoomsListData['rooms'];
  relativeTimeNow: number;
  isRoomsEmpty: boolean;
  headerClassName: string;
  iconButtonClassName: string;
  listItemClassName: string;
  canResizePanel: boolean;
  isDragging: boolean;
  beginWidgetDrag: PointerEventHandler<HTMLElement>;
  closeWidget: () => void;
  onSelectRoom: (roomId: number) => void;
};
export default function ChatRoomList({
  rooms,
  relativeTimeNow,
  isRoomsEmpty,
  headerClassName,
  iconButtonClassName,
  listItemClassName,
  canResizePanel,
  isDragging,
  beginWidgetDrag,
  closeWidget,
  onSelectRoom,
}: Props) {
  return (
    <>
      <div
        className={cn(
          headerClassName,
          'h-[5.6rem] px-[1.8rem]',
          canResizePanel &&
            (isDragging ? 'cursor-grabbing select-none' : 'cursor-grab select-none'),
        )}
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
              <p className="text-[1.4rem] font-semibold text-[var(--ui-900)]">
                대화를 시작해 보세요.
              </p>
              <p className="mt-[0.7rem] text-[1.2rem] leading-[1.6] text-[var(--ui-500)]">
                프로젝트나 개발자 페이지에서 메시지를 보내면
                <br />
                여기에 대화가 표시돼요.
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
                  onSelectRoom(room.roomId);
                }}
                className={cn(
                  listItemClassName,
                  'border-b border-[rgba(255,255,255,0.06)] last:border-b-0',
                )}
              >
                <span
                  className={cn(
                    'flex size-[3.8rem] shrink-0 items-center justify-center overflow-hidden rounded-full text-[1.4rem] font-semibold max-[389px]:size-[3.4rem]',
                    [
                      'bg-[#262230] text-[#C5B8E9]',
                      'bg-[#302B3C] text-[#C5B8E9]',
                      'bg-[#3A3547] text-[#C5B8E9]',
                    ][avatarTone],
                  )}
                >
                  {room.otherMember.image ? (
                    <img src={room.otherMember.image} alt="" className="size-full object-cover" />
                  ) : (
                    room.otherMember.nickname.slice(0, 1)
                  )}
                </span>
                <div className="ml-[1.2rem] flex min-w-0 flex-1 items-start gap-[0.8rem] max-[389px]:ml-[0.8rem] max-[389px]:gap-[0.6rem]">
                  <div className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'Label1 block truncate text-[var(--ui-900)]',
                        isUnread ? 'font-semibold' : 'font-medium',
                      )}
                    >
                      <span className="min-w-0 truncate">{room.otherMember.nickname}</span>
                    </span>
                    <div className="mt-[0.5rem] flex min-w-0 items-baseline gap-[0.5rem]">
                      <p
                        className={cn(
                          'min-w-0 truncate text-[1.2rem] leading-[1.45] tracking-[0.0252em]',
                          isUnread
                            ? 'font-medium text-white'
                            : preview
                              ? 'text-[var(--ui-500)]'
                              : 'text-[var(--ui-400)]',
                        )}
                      >
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
                    <span
                      className="mt-[0.6rem] size-[0.7rem] shrink-0 rounded-full bg-[#8F7AF7]"
                      aria-label="읽지 않은 메시지 있음"
                    />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
