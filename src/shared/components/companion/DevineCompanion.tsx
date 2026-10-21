import { CompanionActions } from './CompanionActions';
import { resolveCompanionMode } from './companion-mode';
import { useLocation } from 'react-router-dom';
import { useIsMutating } from '@tanstack/react-query';
import { useUnreadChatRoomCount } from '@hooks/useUnreadChatRoomCount';
import { companionModeLabels, useCompanionStore } from '@store/companion';
import type { CompanionMode } from '@store/companion';
import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import './devine-companion.css';

// Reset on a full page load; persist across component remounts and route changes.
let arrivalPlayed = false;
const CompanionScene = lazy(() => import('./CompanionScene'));
const Fallback = () => <div className="devine-companion-placeholder" aria-hidden="true"><i /><i /></div>;

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <Fallback /> : this.props.children; }
}

export default function DevineCompanion({ actionsEnabled = false }: { actionsEnabled?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const { pathname } = useLocation();
  const [sceneReady, setSceneReady] = useState(false);
  const [walking, setWalking] = useState(false);
  const introFrame = useRef<number | null>(null);
  const pendingReports = useIsMutating({ mutationKey: ['companion-report-create'] });
  const { data: unread } = useUnreadChatRoomCount({ refetchIntervalMs: actionsEnabled ? 30000 : false });
  const interaction = useCompanionStore(state => state.interaction);
  const [reactionKind, setReactionKind] = useState<'card' | 'bookmark'>('bookmark');
  const handledInteraction = useRef(0);
  const handledSuccess = useRef(0);
  const successVersion = useCompanionStore(state => state.successVersion);
  const [celebrating, setCelebrating] = useState(false);
  const [preview, setPreview] = useState<CompanionMode | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const automaticMode = resolveCompanionMode({ pendingReports, celebrating, pathname, unreadRooms: unread?.unreadRoomCount ?? 0 });
  const mode = preview ?? automaticMode;

  useEffect(() => {
    if (!preview) return;
    const timeout = setTimeout(() => setPreview(null), 15000);
    return () => clearTimeout(timeout);
  }, [preview]);
  useEffect(() => {
    if (!menuOpen) return;
    const dismiss = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [menuOpen]);

  const pointer = useRef({ x: 0, y: 0 });
  const container = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem('devine-companion-hidden') === 'true'; } catch { return false; }
  });
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [active, setActive] = useState(() => !document.hidden);
  const [reaction, setReaction] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [falling, setFalling] = useState(false);
  const [landing, setLanding] = useState(0);
  const fallFrame = useRef<number | null>(null);
  useEffect(() => () => { if (fallFrame.current !== null) cancelAnimationFrame(fallFrame.current); }, []);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const onDragStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || !container.current) return;
    if (fallFrame.current !== null) cancelAnimationFrame(fallFrame.current);
    setFalling(false);
    if (introFrame.current !== null) cancelAnimationFrame(introFrame.current);
    setWalking(false);
    const rect = container.current.getBoundingClientRect();
    drag.current = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, moved: false };
    suppressClick.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onDragMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = drag.current;
    if (!start || !container.current) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    if (!start.moved && Math.hypot(dx, dy) < 5) return;
    start.moved = true;
    setActionsOpen(false); setHovered(false);
    setDragging(true);
    const rect = container.current.getBoundingClientRect();
    setPosition({ x: Math.max(0, Math.min(window.innerWidth - rect.width, start.left + dx)), y: Math.max(0, Math.min(window.innerHeight - rect.height, start.top + dy)) });
  };
  const onDragEnd = () => {
    const moved = drag.current?.moved;
    if (!drag.current) return;
    suppressClick.current = Boolean(moved);
    drag.current = null;
    setDragging(false);
    if (!moved || !container.current) return;
    const rect = container.current.getBoundingClientRect();
    const floorY = Math.max(0, window.innerHeight - rect.height - (window.innerWidth <= 743 ? 80 : 78));
    const x = Math.max(0, Math.min(window.innerWidth - rect.width, rect.left));
    let y = rect.top, velocity = 0, previousTime = 0;
    if (reducedMotion || y >= floorY) {
      setPosition({ x, y: floorY });
      setLanding(value => value + 1);
      return;
    }
    setFalling(true);
    const step = (time: number) => {
      const dt = previousTime ? Math.min((time - previousTime) / 1000, .032) : 1 / 60;
      previousTime = time;
      velocity += 1900 * dt;
      y += velocity * dt;
      if (y >= floorY) {
        setPosition({ x, y: floorY });
        setFalling(false);
        setLanding(value => value + 1);
        fallFrame.current = null;
        return;
      }
      setPosition({ x, y });
      fallFrame.current = requestAnimationFrame(step);
    };
    fallFrame.current = requestAnimationFrame(step);
  };
  const [greeting, setGreeting] = useState(false);
  useEffect(() => {
    if (dragging || falling || walking || hidden || reducedMotion) return;
    if (successVersion !== handledSuccess.current) {
      handledSuccess.current = successVersion;
      handledInteraction.current = interaction.version;
      setCelebrating(true);
    } else if (!celebrating && interaction.version !== handledInteraction.current) {
      handledInteraction.current = interaction.version;
      setReactionKind(interaction.kind);
      setReaction(value => value + 1);
    }
  }, [interaction, successVersion, dragging, falling, walking, hidden, reducedMotion, celebrating]);
  useEffect(() => {
    if (!celebrating) return;
    const timeout = setTimeout(() => setCelebrating(false), 1800);
    return () => clearTimeout(timeout);
  }, [celebrating]);

  useEffect(() => {
    if (arrivalPlayed || !sceneReady || hidden || reducedMotion || !container.current) return;
    arrivalPlayed = true;
    const rect = container.current.getBoundingClientRect();
    const floor = Math.max(0, window.innerHeight - rect.height - (window.innerWidth <= 743 ? 80 : 78));
    const startX = Math.max(0, (window.innerWidth - rect.width) / 2);
    const startY = Math.min(floor, window.innerHeight * .28);
    let started = 0, walkStart = 0;
    setPosition({ x: startX, y: startY });
    setFalling(true);
    const frame = (now: number) => {
      if (!started) started = now;
      const elapsed = (now - started) / 1000;
      const y = Math.min(floor, startY + .5 * 1900 * elapsed * elapsed);
      if (!walkStart && y < floor) setPosition({ x: startX, y });
      else {
        if (!walkStart) {
          walkStart = now;
          setFalling(false);
          setLanding(value => value + 1);
          setPosition({ x: startX, y: floor });
        }
        const age = (now - walkStart) / 1000 - .45;
        if (age >= 0) {
          setWalking(true);
          const duration = Math.max(1, startX / 260);
          const t = Math.min(1, age / duration);
          const ease = t * t * (3 - 2 * t);
          setPosition({ x: startX * (1 - ease), y: floor });
          if (t === 1) { setWalking(false); setPosition(null); introFrame.current = null; return; }
        }
      }
      introFrame.current = requestAnimationFrame(frame);
    };
    introFrame.current = requestAnimationFrame(frame);
    return () => {
      if (introFrame.current !== null) cancelAnimationFrame(introFrame.current);
      setFalling(false); setWalking(false);
    };
  }, [sceneReady, hidden, reducedMotion]);


  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => setReducedMotion(media.matches);
    const onVisibility = () => setActive(!document.hidden);
    media.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      media.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (hidden || reducedMotion) return;
    const onPointer = (event: PointerEvent) => {
      const rect = container.current?.getBoundingClientRect();
      if (!rect) return;
      pointer.current = {
        x: Math.max(-1, Math.min(1, (event.clientX - rect.left - rect.width / 2) / 350)),
        y: Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - event.clientY) / 350)),
      };
    };
    const reset = () => { pointer.current = { x: 0, y: 0 }; };
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('blur', reset);
    return () => { window.removeEventListener('pointermove', onPointer); window.removeEventListener('blur', reset); };
  }, [hidden, reducedMotion]);

  const toggleHidden = (value: boolean) => {
    setHidden(value);
    setActionsOpen(false);
    setGreeting(false);
    setMenuOpen(false);
    setPreview(null);
    try { localStorage.setItem('devine-companion-hidden', String(value)); } catch { /* Storage can be unavailable. */ }
  };
  const greet = () => {
    if (suppressClick.current) { suppressClick.current = false; return; }
    setReactionKind('bookmark');
    setReaction((value) => value + 1);
    setActionsOpen(value => !value);
    setGreeting(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setGreeting(false), 2200);
  };

  if (hidden) return <button className="devine-companion-restore" type="button" onClick={() => toggleHidden(false)} aria-label="디바인봇 보이기">디바인 도우미{(unread?.unreadRoomCount ?? 0) > 0 ? ` · ${unread?.unreadRoomCount}` : ''}</button>;

  return <div className="devine-companion" ref={container} aria-label="디바인봇" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} data-mode={mode} data-dragging={dragging} data-falling={falling} style={position ? { left: position.x, top: position.y, bottom: 'auto' } : undefined}>
    <CompanionActions anchor={container} open={actionsOpen} setOpen={setActionsOpen} hovered={hovered} busy={dragging || falling || walking} unread={unread?.unreadRoomCount ?? 0} enabled={actionsEnabled} />
    {(unread?.unreadRoomCount ?? 0) > 0 && <span className="companion-unread-badge" role="status" aria-label={`읽지 않은 채팅방 ${unread?.unreadRoomCount}개`}>{(unread?.unreadRoomCount ?? 0) > 99 ? '99+' : unread?.unreadRoomCount}</span>}
    <div className="devine-companion-caption" role="status">{greeting ? '반가워요! 함께 만들어 봐요.' : preview ? `미리보기 · ${companionModeLabels[preview]}` : ''}</div>
    {landing > 0 && !reducedMotion && <div key={landing} className="devine-companion-dust" aria-hidden="true">{[0, 1, 2, 3, 4, 5, 6, 7].map(index => <i key={index} />)}</div>}
    <div className="devine-companion-stage">
      <SceneBoundary><Suspense fallback={null}><CompanionScene reactionKind={reactionKind} onReady={setSceneReady} walking={walking} landing={landing} dragging={dragging || falling} mode={mode} pointer={pointer} reaction={reaction} reducedMotion={reducedMotion} active={active} /></Suspense></SceneBoundary>
    </div>
    <button className="devine-companion-touch" type="button" onPointerDown={onDragStart} onPointerMove={onDragMove} onPointerUp={onDragEnd} onPointerCancel={onDragEnd} onLostPointerCapture={onDragEnd} onClick={greet} onFocus={() => setHovered(true)} onBlur={() => setHovered(false)} aria-label="디바인 도우미 메뉴 열기" aria-expanded={actionsOpen} aria-haspopup="dialog" title="클릭하면 메시지와 프로젝트 등록 메뉴가 열려요" />
    <div className="devine-companion-controls" ref={menuRef}>
      <button className="devine-companion-modes-toggle" type="button" aria-label="디바인봇 동작 보기" aria-expanded={menuOpen} aria-controls="devine-companion-modes" onClick={() => setMenuOpen(value => !value)}>···</button>
      {menuOpen && <div className="devine-companion-modes" id="devine-companion-modes" aria-label="동작 미리보기">
        <button type="button" aria-pressed={preview === null} onClick={() => { setPreview(null); setMenuOpen(false); }}>자동으로 반응하기</button>
        {(Object.keys(companionModeLabels) as CompanionMode[]).filter(value => value !== 'laptop').map(value => <button key={value} type="button" aria-pressed={preview === value} onClick={() => { setPreview(value); setMenuOpen(false); }}>{companionModeLabels[value]}</button>)}
      </div>}
    </div>
  </div>;
}
