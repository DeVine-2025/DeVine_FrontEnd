import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
const DEFAULT_CHAT_WIDTH_PX = 310;
const DEFAULT_CHAT_HEIGHT_PX = 458;
const MIN_CHAT_WIDTH_PX = 280;
const MIN_CHAT_HEIGHT_PX = 320;
const CHAT_SIZE_STORAGE_KEY = 'devine.chatWidget.size';
const CHAT_POSITION_STORAGE_KEY = 'devine.chatWidget.position';
const DESKTOP_RESIZE_MQ = '(min-width: 744px)';

type ChatPanelSize = { width: number; height: number };
type ChatPosition = { left: number; bottom: number };
type ResizeEdge = 'left' | 'top' | 'corner';

function readStoredChatPosition(): ChatPosition | null {
  try {
    const raw = window.localStorage.getItem(CHAT_POSITION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ChatPosition>;
    return typeof parsed.left === 'number' &&
      Number.isFinite(parsed.left) &&
      typeof parsed.bottom === 'number' &&
      Number.isFinite(parsed.bottom)
      ? { left: parsed.left, bottom: parsed.bottom }
      : null;
  } catch {
    return null;
  }
}

function clampChatPosition(position: ChatPosition, width: number, height: number): ChatPosition {
  const margin = 12;
  return {
    left: Math.min(
      Math.max(margin, window.innerWidth - width - margin),
      Math.max(margin, position.left),
    ),
    bottom: Math.min(
      Math.max(margin, window.innerHeight - height - margin),
      Math.max(margin, position.bottom),
    ),
  };
}

function readStoredChatSize(): ChatPanelSize {
  try {
    const raw = window.localStorage.getItem(CHAT_SIZE_STORAGE_KEY);
    if (!raw) return { width: DEFAULT_CHAT_WIDTH_PX, height: DEFAULT_CHAT_HEIGHT_PX };
    const parsed = JSON.parse(raw) as Partial<ChatPanelSize>;
    const width = typeof parsed.width === 'number' ? parsed.width : DEFAULT_CHAT_WIDTH_PX;
    const height = typeof parsed.height === 'number' ? parsed.height : DEFAULT_CHAT_HEIGHT_PX;
    return { width, height };
  } catch {
    return { width: DEFAULT_CHAT_WIDTH_PX, height: DEFAULT_CHAT_HEIGHT_PX };
  }
}

function clampChatSize(size: ChatPanelSize): ChatPanelSize {
  const maxWidth = Math.max(MIN_CHAT_WIDTH_PX, window.innerWidth - 20);
  const maxHeight = Math.max(MIN_CHAT_HEIGHT_PX, window.innerHeight - 12);
  return {
    width: Math.min(maxWidth, Math.max(MIN_CHAT_WIDTH_PX, Math.round(size.width))),
    height: Math.min(maxHeight, Math.max(MIN_CHAT_HEIGHT_PX, Math.round(size.height))),
  };
}

function useDesktopChatResizeEnabled() {
  const [enabled, setEnabled] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(DESKTOP_RESIZE_MQ).matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_RESIZE_MQ);
    const onChange = () => setEnabled(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return enabled;
}

export function useChatPanelGeometry(
  isExpanded: boolean,
  isRoomView: boolean,
  chatListPanelHeightRem: number,
) {
  const [panelSize, setPanelSize] = useState<ChatPanelSize>(() =>
    typeof window !== 'undefined'
      ? clampChatSize(readStoredChatSize())
      : {
          width: DEFAULT_CHAT_WIDTH_PX,
          height: DEFAULT_CHAT_HEIGHT_PX,
        },
  );
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState<ChatPosition | null>(() =>
    typeof window !== 'undefined' ? readStoredChatPosition() : null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const widgetRef = useRef<HTMLElement | null>(null);
  const dragCleanupRef = useRef<(() => void) | null>(null);
  const lastDragEndRef = useRef(0);
  const resizeSessionRef = useRef<{
    edge: ResizeEdge;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);
  const canResizePanel = useDesktopChatResizeEnabled();
  useEffect(() => {
    if (!canResizePanel) return;
    const onWindowResize = () => {
      setPanelSize((prev) => clampChatSize(prev));
      const widget = widgetRef.current;
      if (widget) {
        const { width, height } = widget.getBoundingClientRect();
        setPosition((current) => current && clampChatPosition(current, width, height));
      }
    };
    window.addEventListener('resize', onWindowResize);
    return () => window.removeEventListener('resize', onWindowResize);
  }, [canResizePanel]);

  useEffect(() => () => dragCleanupRef.current?.(), []);

  const beginWidgetDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!canResizePanel || event.button !== 0 || !event.isPrimary) return;
      if (
        isExpanded &&
        (event.target as Element).closest('button, a, input, textarea, [data-no-drag]')
      )
        return;
      const widget = widgetRef.current;
      if (!widget) return;
      const rect = widget.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = rect.left;
      const startBottom = window.innerHeight - rect.bottom;
      let moved = false;
      let latestPosition: ChatPosition | null = null;

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== event.pointerId) return;
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        if (!moved && Math.hypot(deltaX, deltaY) < 5) return;
        moved = true;
        setIsDragging(true);
        latestPosition = clampChatPosition(
          { left: startLeft + deltaX, bottom: startBottom - deltaY },
          rect.width,
          rect.height,
        );
        setPosition(latestPosition);
      };

      const cleanup = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
        dragCleanupRef.current = null;
        setIsDragging(false);
      };
      const onPointerUp = (upEvent: PointerEvent) => {
        if (upEvent.pointerId !== event.pointerId) return;
        cleanup();
        if (!moved || !latestPosition) return;
        if (!isExpanded) lastDragEndRef.current = Date.now();
        try {
          window.localStorage.setItem(CHAT_POSITION_STORAGE_KEY, JSON.stringify(latestPosition));
        } catch {
          // Storage may be unavailable; keep the position for this session.
        }
      };

      dragCleanupRef.current?.();
      dragCleanupRef.current = cleanup;
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    },
    [canResizePanel, isExpanded],
  );

  const beginPanelResize = useCallback(
    (edge: ResizeEdge, event: ReactPointerEvent<HTMLDivElement>) => {
      if (!canResizePanel || !isExpanded) return;
      event.preventDefault();
      event.stopPropagation();
      resizeSessionRef.current = {
        edge,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: panelSize.width,
        startHeight: panelSize.height,
      };
      setIsResizing(true);

      const onPointerMove = (moveEvent: PointerEvent) => {
        const session = resizeSessionRef.current;
        if (!session) return;
        let nextWidth = session.startWidth;
        let nextHeight = session.startHeight;
        if (session.edge === 'left' || session.edge === 'corner') {
          nextWidth = session.startWidth + (session.startX - moveEvent.clientX);
        }
        if (session.edge === 'top' || session.edge === 'corner') {
          nextHeight = session.startHeight + (session.startY - moveEvent.clientY);
        }
        setPanelSize(clampChatSize({ width: nextWidth, height: nextHeight }));
      };

      const onPointerUp = () => {
        resizeSessionRef.current = null;
        setIsResizing(false);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        setPanelSize((current) => {
          const next = clampChatSize(current);
          try {
            window.localStorage.setItem(CHAT_SIZE_STORAGE_KEY, JSON.stringify(next));
          } catch {
            // ignore
          }
          return next;
        });
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    },
    [canResizePanel, isExpanded, panelSize.height, panelSize.width],
  );

  useLayoutEffect(() => {
    if (!canResizePanel || !position || !widgetRef.current) return;
    const { width, height } = widgetRef.current.getBoundingClientRect();
    setPosition((current) => {
      if (!current) return current;
      const clamped = clampChatPosition(current, width, height);
      return clamped.left === current.left && clamped.bottom === current.bottom ? current : clamped;
    });
  }, [
    canResizePanel,
    position,
    isExpanded,
    isRoomView,
    panelSize.width,
    panelSize.height,
    chatListPanelHeightRem,
  ]);

  return {
    panelSize,
    isResizing,
    position,
    isDragging,
    widgetRef,
    lastDragEndRef,
    canResizePanel,
    beginWidgetDrag,
    beginPanelResize,
  };
}
