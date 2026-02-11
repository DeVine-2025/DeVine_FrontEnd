import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];

  anchorRef?: React.RefObject<HTMLElement | null>;

  onMarkAsRead?: (notificationId: string) => void;

  onMarkAllAsRead?: () => void;

  /** 다음 페이지가 있으면 true. 이때 하단에 "더 보기" 노출 */
  hasMore?: boolean;
  /** 더 보기 클릭 시 호출 */
  onLoadMore?: () => void;
  /** 더 보기 요청 중이면 true (로딩 표시) */
  loadingMore?: boolean;
}

const GAP_PX = 8;
const MODAL_WIDTH = 320;
const MODAL_HEIGHT = 220;

const NotificationModal = ({
  isOpen,
  onClose,
  notifications,
  anchorRef,
  onMarkAsRead,
  onMarkAllAsRead,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
}: NotificationModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  const updatePosition = () => {
    if (!anchorRef?.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + GAP_PX,
      right: window.innerWidth - rect.right,
    });
  };

  useLayoutEffect(() => {
    if (!isOpen || !anchorRef) return;
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, anchorRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  if (!isOpen && !isClosing) return null;
  // anchorRef 사용 시 위치 계산 후 렌더
  if (anchorRef && position === null) return null;

  const useAnchor = anchorRef?.current && position !== null;
  const modalHeight =
    notifications.length === 0 ? 200 : notifications.length === 1 ? 220 : Math.min(400, 120 + notifications.length * 100);

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div
        ref={modalRef}
        className={`pointer-events-auto flex w-[360px] flex-col overflow-hidden rounded-2xl border border-[var(--ui-200)] bg-[var(--ui-bg)] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] ${
          !useAnchor ? 'absolute top-[7.6rem] right-[32rem] tablet:right-[18rem] max-[391px]:right-[5rem] max-[743px]:right-[10rem]' : ''
        } ${isClosing ? 'animate-modal-pop-out' : 'animate-modal-pop-in'}`}
        style={
          useAnchor
            ? { position: 'fixed', top: position.top, right: position.right, width: 360, height: modalHeight }
            : { height: modalHeight }
        }
      >
        <div className="shrink-0 border-b border-[var(--ui-200)] bg-[var(--ui-50)]/50 px-4 py-3.5">
          <h2 className="text-[15px] font-semibold text-[var(--ui-900)]">알림</h2>
        </div>
        <div
          className={`flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3 ${notifications.length === 1 ? 'justify-center' : ''}`}
        >
          {notifications.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ui-100)] text-[var(--ui-400)]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <p className="text-[14px] font-medium text-[var(--ui-600)]">아직 새 알림이 없어요</p>
              <p className="text-[12px] text-[var(--ui-400)]">새 소식이 오면 여기에 표시돼요</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => {
                  if (!notification.isRead && onMarkAsRead) onMarkAsRead(notification.id);
                  handleClose();
                }}
                className={`group relative flex min-h-[100px] flex-col justify-center gap-1.5 rounded-xl px-3.5 py-5 text-left transition-colors duration-150 ${
                  !notification.isRead
                    ? 'bg-[var(--ui-50)] hover:bg-[var(--ui-100)]'
                    : 'hover:bg-[var(--ui-50)]'
                }`}
              >
                {!notification.isRead && (
                  <span className="absolute left-1 top-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#4E49FF]" />
                )}
                <div className="flex items-start justify-between gap-2 pl-0.5">
                  <h3
                    className={`min-w-0 flex-1 truncate text-[14px] font-semibold leading-tight ${
                      !notification.isRead ? 'text-[var(--ui-900)]' : 'text-[var(--ui-600)]'
                    }`}
                  >
                    {notification.title}
                  </h3>
                  <span className="shrink-0 text-[11px] text-[var(--ui-400)]">{notification.timestamp}</span>
                </div>
                <p className="line-clamp-2 pl-0.5 text-[13px] leading-snug text-[var(--ui-600)]">
                  {notification.description.includes('프로젝트에') ? (
                    <>
                      {notification.description.split('프로젝트에')[0]}
                      프로젝트에
                      <br />
                      {notification.description.split('프로젝트에').slice(1).join('프로젝트에')}
                    </>
                  ) : (
                    notification.description
                  )}
                </p>
              </button>
            ))
          )}
          {hasMore && onLoadMore && (
            <div className="shrink-0 border-t border-[var(--ui-200)] px-3 py-2">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={loadingMore}
                className="w-full rounded-xl py-2.5 text-[13px] font-medium text-[var(--ui-500)] transition-colors hover:text-[#4E49FF] disabled:opacity-60"
              >
                {loadingMore ? '불러오는 중…' : '더 보기'}
              </button>
            </div>
          )}
        </div>
        {onMarkAllAsRead && notifications.some((n) => !n.isRead) && (
          <div className="shrink-0 border-t border-[var(--ui-200)] bg-[var(--ui-50)]/30 px-3 py-3">
            <button
              type="button"
              onClick={() => onMarkAllAsRead()}
              className="w-full rounded-xl py-2.5 text-[13px] font-medium text-[var(--ui-500)] transition-colors hover:text-[#4E49FF]"
            >
              전체 읽음 처리
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;
