import { useEffect, useRef, useState } from 'react';

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
}

const NotificationModal = ({ isOpen, onClose, notifications }: NotificationModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

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

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div
        ref={modalRef}
        className={`pointer-events-auto absolute top-[7.6rem] right-[32rem] tablet:right-[18rem] h-[260px] w-[376px] overflow-hidden rounded-[16px] border border-[var(--ui-200)] bg-[var(--ui-bg)] shadow-lg max-[391px]:right-[5rem] max-[743px]:right-[10rem] ${
          isClosing ? 'animate-modal-pop-out' : 'animate-modal-pop-in'
        }`}
      >
        <div className="flex h-full flex-col">
          {notifications.slice(0, 2).map((notification) => (
            <div
              key={notification.id}
              className="flex min-h-0 flex-1 flex-col border-[var(--ui-200)] border-b px-[2.4rem] py-[1.6rem] first:rounded-t-[16px] last:rounded-b-[16px] last:border-b-0"
            >
              <button
                type="button"
                onClick={handleClose}
                className="-mx-[1.2rem] -my-[0.8rem] flex min-h-0 flex-1 cursor-pointer flex-col justify-center rounded-[12px] px-[2.4rem] py-[1.6rem] transition-colors duration-300 hover:bg-[var(--ui-50)]"
              >
                <div className="mb-[0.8rem] flex-row-between items-start">
                  <h3 className="Heading2 flex-1 font-bold text-[#7E7AFF]">{notification.title}</h3>
                  <span className="Caption1 ml-[1.2rem] shrink-0 whitespace-nowrap text-[var(--ui-400)]">
                    {notification.timestamp}
                  </span>
                </div>
                <p className="Caption1 text-[var(--ui-700)]">{notification.description}</p>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
