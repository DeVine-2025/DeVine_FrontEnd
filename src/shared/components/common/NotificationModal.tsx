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
        className={`pointer-events-auto h-[220px] w-[320px] overflow-hidden rounded-2xl border border-[var(--ui-200)] bg-[var(--ui-bg)] shadow-xl shadow-black/10 ${
          !useAnchor ? 'absolute top-[7.6rem] right-[32rem] tablet:right-[18rem] max-[391px]:right-[5rem] max-[743px]:right-[10rem]' : ''
        } ${isClosing ? 'animate-modal-pop-out' : 'animate-modal-pop-in'}`}
        style={
          useAnchor
            ? { position: 'fixed', top: position.top, right: position.right, width: MODAL_WIDTH, height: MODAL_HEIGHT }
            : undefined
        }
      >
        <div className="flex h-full flex-col">
          {notifications.slice(0, 2).map((notification) => (
            <div
              key={notification.id}
              className={`relative flex min-h-0 flex-1 flex-col first:rounded-t-2xl last:rounded-b-2xl last:border-b-0 ${
                !notification.isRead ? 'border-l-2 border-l-[#4E49FF] bg-[var(--ui-50)]/50' : ''
              } border-b border-[var(--ui-200)]`}
            >
              <button
                type="button"
                onClick={() => {
                  if (!notification.isRead && onMarkAsRead) onMarkAsRead(notification.id);
                  handleClose();
                }}
                className="flex min-h-0 flex-1 cursor-pointer flex-col justify-center px-4 py-3.5 text-left transition-colors duration-200 hover:bg-[var(--ui-50)]/80"
              >
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <h3
                    className={`flex-1 truncate text-[15px] font-semibold leading-tight ${
                      !notification.isRead ? 'text-[var(--ui-900)]' : 'text-[var(--ui-600)]'
                    }`}
                  >
                    {notification.title}
                  </h3>
                  <span className="shrink-0 text-[12px] text-[var(--ui-400)]">{notification.timestamp}</span>
                </div>
                <p className="line-clamp-2 text-[13px] leading-snug text-[var(--ui-600)]">{notification.description}</p>
              </button>
            </div>
          ))}
          {onMarkAllAsRead && notifications.some((n) => !n.isRead) && (
            <div className="shrink-0 border-t border-[var(--ui-200)] px-3 py-2">
              <button
                type="button"
                onClick={() => onMarkAllAsRead()}
                className="w-full rounded-xl py-2.5 text-[13px] font-medium text-[var(--ui-500)] transition-colors hover:bg-[var(--ui-50)] hover:text-[var(--ui-700)]"
              >
                전체 읽음 처리
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
