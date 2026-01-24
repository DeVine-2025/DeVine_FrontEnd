import { useRef, useEffect, useState } from 'react';

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
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        ref={modalRef}
        className={`absolute top-[7.6rem] right-[32rem] tablet:right-[18rem] max-[743px]:right-[10rem] max-[391px]:right-[5rem] w-[376px] h-[260px] bg-[var(--ui-bg)] border border-[var(--ui-200)] rounded-[16px] rounded-t-[8px] shadow-lg pointer-events-auto overflow-hidden ${
          isClosing ? 'animate-modal-pop-out' : 'animate-modal-pop-in'
        }`}
      >
        <div className="flex flex-col h-full">
          {notifications.slice(0, 2).map((notification) => (
            <div
              key={notification.id}
              className="flex-1 flex flex-col min-h-0 border-b border-[var(--ui-200)] last:border-b-0 first:rounded-t-[8px] last:rounded-b-[16px] px-[2.4rem] py-[1.6rem]"
            >
              <div
                onClick={handleClose}
                className="flex-1 flex flex-col justify-center min-h-0 -mx-[1.2rem] -my-[0.8rem] px-[2.4rem] py-[1.6rem] rounded-[12px] transition-colors duration-300 cursor-pointer hover:bg-[var(--ui-50)]"
              >
                <div className="flex-row-between items-start mb-[0.8rem]">
                  <h3 className="Heading2 font-bold text-[#7E7AFF] flex-1">
                    {notification.title}
                  </h3>
                  <span className="Caption1 text-[var(--ui-400)] ml-[1.2rem] shrink-0 whitespace-nowrap">
                    {notification.timestamp}
                  </span>
                </div>
                <p className="Caption1 text-[var(--ui-700)]">
                  {notification.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
