import type { NotificationItem } from '@apis/notifications';
import UnderlineTabs from '@components/tab/UnderlineTabs';
import { Bell, CheckCheck, X } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import './notification-modal.css';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  anchorRef?: React.RefObject<HTMLElement | null>;
  loading?: boolean;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onNotificationClick?: (notification: NotificationItem) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
}

const GAP_PX = 8;
const EDGE_PX = 12;
const PANEL_WIDTH_PX = 384;
const notificationFilters = [
  { value: 'all', label: '전체' },
  { value: 'unread', label: '안 읽음' },
  { value: 'read', label: '읽음' },
] as const;

type NotificationFilter = (typeof notificationFilters)[number]['value'];

export default function NotificationModal({
  isOpen,
  onClose,
  notifications,
  anchorRef,
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
}: NotificationModalProps) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);
  const ready = !anchorRef || position !== null;

  useLayoutEffect(() => {
    if (!isOpen || !anchorRef) return;

    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const width = Math.min(PANEL_WIDTH_PX, window.innerWidth - EDGE_PX * 2);
      const top = Math.max(EDGE_PX, rect.bottom + GAP_PX);
      const right = Math.min(Math.max(EDGE_PX, window.innerWidth - rect.right), window.innerWidth - width - EDGE_PX);
      setPosition((current) => current?.top === top && current.right === right ? current : { top, right });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, anchorRef]);

  useEffect(() => {
    if (isOpen && ready) closeRef.current?.focus({ preventScroll: true });
  }, [isOpen, ready]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !anchorRef?.current?.contains(target)) onClose();
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      onClose();
      anchorRef?.current?.focus({ preventScroll: true });
    };

    document.addEventListener('pointerdown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen || !ready) return null;

  const unread = notifications.filter((item) => !item.isRead).length;
  const visibleNotifications = filter === 'all'
    ? notifications
    : notifications.filter((item) => item.isRead === (filter === 'read'));
  const closeAndRestoreFocus = () => {
    onClose();
    anchorRef?.current?.focus({ preventScroll: true });
  };

  return (
    <section
      ref={panelRef}
      className="notification-panel"
      aria-labelledby={titleId}
      style={position ? { ...position, maxHeight: `calc(100dvh - ${position.top + EDGE_PX}px)` } : undefined}
    >
      <header className="notification-panel-header">
        <span className="notification-panel-icon"><Bell size={18} aria-hidden="true" /></span>
        <h2 id={titleId}>알림</h2>
        {unread > 0 && <span className="notification-panel-count" aria-label={`목록의 읽지 않은 알림 ${unread}개`}>{unread}</span>}
        <button ref={closeRef} type="button" className="notification-panel-close" aria-label="알림 닫기" onClick={closeAndRestoreFocus}>
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="notification-panel-filter-row">
        <UnderlineTabs
          label="알림 필터"
          className="notification-panel-filters"
          value={filter}
          items={notificationFilters.map(({ value, label }) => ({
            value,
            label: value === 'unread' && unread > 0
              ? <>{label}<span className="notification-panel-count">{unread}</span></>
              : label,
          }))}
          onChange={(value) => {
            setFilter(value);
            if (listRef.current) listRef.current.scrollTop = 0;
          }}
        />
      </div>

      <div ref={listRef} className="notification-panel-body" aria-busy={loading}>
        {loading ? (
          <p className="notification-panel-state" role="status">알림을 불러오는 중이에요.</p>
        ) : visibleNotifications.length === 0 ? (
          <div className="notification-panel-state">
            <Bell size={22} aria-hidden="true" />
            <strong>{hasMore ? '현재 목록에 해당하는 알림이 없어요' : filter === 'unread' ? '안 읽은 알림이 없어요' : filter === 'read' ? '읽은 알림이 없어요' : '아직 새 알림이 없어요'}</strong>
            {hasMore ? <span>이전 알림은 더 보기에서 확인할 수 있어요.</span>
              : filter === 'all' && <span>새 소식이 오면 여기에 표시돼요.</span>}
          </div>
        ) : (
          <ul className="notification-panel-list">
            {visibleNotifications.map((notification) => (
              <li key={notification.id}>
                <button
                  type="button"
                  className="notification-panel-item"
                  data-unread={!notification.isRead}
                  onClick={() => {
                    if (onNotificationClick) onNotificationClick(notification);
                    else if (!notification.isRead) onMarkAsRead?.(notification.id);
                    closeAndRestoreFocus();
                  }}
                >
                  <span className="notification-panel-dot" aria-hidden="true" />
                  {!notification.isRead && <span className="sr-only">읽지 않음</span>}
                  <span className="notification-panel-summary">
                    <span className="notification-panel-title">{notification.title}</span>
                    <span className="notification-panel-description">{notification.description}</span>
                  </span>
                  <span className="notification-panel-time">{notification.timestamp}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {hasMore && onLoadMore && (
          <button type="button" className="notification-panel-more" disabled={loadingMore} onClick={onLoadMore}>
            {loadingMore ? '불러오는 중…' : '더 보기'}
          </button>
        )}
      </div>

      {onMarkAllAsRead && unread > 0 && (
        <footer className="notification-panel-footer">
          <button type="button" onClick={onMarkAllAsRead}>
            <CheckCheck size={16} aria-hidden="true" /> 전체 읽음 처리
          </button>
        </footer>
      )}
    </section>
  );
}
