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

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div
        ref={modalRef}
        className={`pointer-events-auto flex h-[240px] w-[340px] flex-col overflow-hidden rounded-3xl border border-[var(--ui-200)] bg-[var(--ui-bg)] shadow-xl backdrop-blur-sm ${
          !useAnchor ? 'absolute top-[7.6rem] right-[32rem] tablet:right-[18rem] max-[391px]:right-[5rem] max-[743px]:right-[10rem]' : ''
        } ${isClosing ? 'animate-modal-pop-out' : 'animate-modal-pop-in'}`}
        style={
          useAnchor
            ? { position: 'fixed', top: position.top, right: position.right, width: 340, height: 240 }
            : undefined
        }
      >
        <div className="shrink-0 border-b border-[var(--ui-200)] px-4 py-3" />
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-1 px-4 py-8">
              <p className="text-[13px] text-[var(--ui-500)]">아직 새 알림이 없어요</p>
              <p className="text-[11px] text-[var(--ui-400)]">새 소식이 오면 여기에 표시돼요</p>
            </div>
          ) : (
            notifications.slice(0, 2).map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => {
                  if (!notification.isRead && onMarkAsRead) onMarkAsRead(notification.id);
                  handleClose();
                }}
                className={`group relative flex min-h-0 flex-1 flex-col gap-1 px-4 py-3.5 text-left transition-colors duration-150 ${
                  !notification.isRead
                    ? 'bg-[var(--ui-50)] hover:bg-[var(--ui-100)]'
                    : 'hover:bg-[var(--ui-50)]'
                }`}
              >
                {!notification.isRead && (
                  <span className="absolute left-2 top-4 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4E49FF]" />
                )}
                <div className="flex items-start justify-between gap-2 pl-1">
                  <h3
                    className={`flex-1 truncate text-[14px] font-medium leading-tight ${
                      !notification.isRead ? 'text-[var(--ui-900)]' : 'text-[var(--ui-600)]'
                    }`}
                  >
                    {notification.title}
                  </h3>
                  <span className="shrink-0 text-[11px] text-[var(--ui-400)]">{notification.timestamp}</span>
                </div>
                <p className="line-clamp-2 pl-1 text-[12px] leading-snug text-[var(--ui-600)]">
                  {notification.description}
                </p>
              </button>
            ))
          )}
        </div>
        {onMarkAllAsRead && notifications.some((n) => !n.isRead) && (
          <div className="shrink-0 border-t border-[var(--ui-200)] px-3 py-2.5">
            <button
              type="button"
              onClick={() => onMarkAllAsRead()}
              className="w-full rounded-2xl py-2 text-[12px] font-medium text-[var(--ui-500)] transition-colors hover:bg-[var(--ui-100)] hover:text-[var(--ui-700)]"
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
