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
  /** 알림 아이콘 ref. 주면 모달이 아이콘 옆에 붙음 */
  anchorRef?: React.RefObject<HTMLElement | null>;
}

const GAP_PX = 8;
const MODAL_WIDTH = 320;
const MODAL_HEIGHT = 220;

const NotificationModal = ({ isOpen, onClose, notifications, anchorRef }: NotificationModalProps) => {
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
        className={`pointer-events-auto h-[220px] w-[320px] overflow-hidden rounded-[12px] border border-[var(--ui-200)] bg-[var(--ui-bg)] shadow-lg ${
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
              className="flex min-h-0 flex-1 flex-col border-[var(--ui-200)] border-b px-[1.6rem] py-[1.2rem] first:rounded-t-[12px] last:rounded-b-[12px] last:border-b-0"
            >
              <button
                type="button"
                onClick={handleClose}
                className="-mx-[0.8rem] -my-[0.6rem] flex min-h-0 flex-1 cursor-pointer flex-col justify-center rounded-[10px] px-[1.6rem] py-[1.2rem] transition-colors duration-300 hover:bg-[var(--ui-50)]"
              >
                <div className="mb-[0.6rem] flex-row-between items-start">
                  <h3 className="Headline1 flex-1 font-bold text-[#7E7AFF]">{notification.title}</h3>
                  <span className="ml-[0.8rem] shrink-0 whitespace-nowrap text-[1rem] text-[var(--ui-400)]">
                    {notification.timestamp}
                  </span>
                </div>
                <p className="text-[1rem] leading-normal text-[var(--ui-700)]">{notification.description}</p>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
