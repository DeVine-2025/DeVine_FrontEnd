import { useEffect, useId, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useChatWidgetStore } from '@store/chatWidget';

export function CompanionActions({ anchor, open, setOpen, hovered, busy, unread, enabled }: {
  anchor: RefObject<HTMLDivElement | null>; open: boolean; setOpen: (open: boolean) => void;
  hovered: boolean; busy: boolean; unread: number; enabled: boolean;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ left: 12, top: 12 });
  const [welcome, setWelcome] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem('devine-helper-discovered')) return;
      setWelcome(true);
      const timer = setTimeout(() => setWelcome(false), 6500);
      return () => clearTimeout(timer);
    } catch { /* Hover guidance remains available. */ }
  }, []);
  useEffect(() => { setOpen(false); }, [pathname, setOpen]);
  useLayoutEffect(() => {
    if (busy || (!open && !hovered && !welcome)) return;
    const place = () => {
      const rect = anchor.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(250, window.innerWidth - 24);
      const height = open ? (panel.current?.offsetHeight ?? 204) : 70;
      const left = rect.left + rect.width * .65;
      const x = left + width < window.innerWidth - 12 ? left : rect.left - width + rect.width * .3;
      const y = rect.top - height + 36;
      setBounds({ left: Math.max(12, Math.min(window.innerWidth - width - 12, x)), top: Math.max(12, Math.min(window.innerHeight - height - 12, y)) });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [open, hovered, welcome, busy, anchor]);
  useEffect(() => {
    if (!open) return;
    setWelcome(false);
    try { localStorage.setItem('devine-helper-discovered', '1'); } catch { /* Optional preference. */ }
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const dismiss = (event: PointerEvent) => {
      if (!panel.current?.contains(event.target as Node) && !anchor.current?.contains(event.target as Node)) setOpen(false);
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        anchor.current?.querySelector<HTMLButtonElement>('.devine-companion-touch')?.focus();
      }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', keydown); };
  }, [open, setOpen, anchor]);
  const hint = pathname.startsWith('/recommend') ? '나에게 맞는 추천을 확인해 보세요.'
    : pathname.startsWith('/report') ? '코드 분석 리포트를 살펴볼까요?'
    : pathname.startsWith('/my-project') ? '지원한 프로젝트를 확인해 볼까요?'
    : pathname.startsWith('/my-info') ? '프로필을 더 채워볼까요?'
    : /^\/project\/\d+/.test(pathname) ? '궁금한 점은 메시지로 물어보세요.'
    : '함께할 프로젝트를 찾아볼까요?';
  if (busy || (!open && !hovered && !welcome)) return null;
  return createPortal(open ? (
    <div ref={panel} className="companion-action-panel" role="dialog" aria-label="디바인 도우미" style={bounds}
      onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node) && !anchor.current?.contains(event.relatedTarget as Node)) setOpen(false); }}>
      <div className="companion-action-heading"><span>무엇을 도와드릴까요?</span><button type="button" aria-label="도우미 메뉴 닫기" onClick={() => { setOpen(false); anchor.current?.querySelector<HTMLButtonElement>('.devine-companion-touch')?.focus(); }}>×</button></div>
      <button type="button" onClick={() => { setOpen(false); if (enabled) useChatWidgetStore.getState().requestOpenList(); else navigate('/login'); }}>
        <span className="companion-action-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 3v-3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M7 10h.01M12 10h.01M17 10h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg></span><span>메시지 보기</span>{unread > 0 && <b className="companion-action-count">{unread > 99 ? '99+' : unread}</b>}<span className="companion-action-chevron" aria-hidden="true">›</span>
      </button>
      {!pathname.startsWith('/project/create') && <Link to={enabled ? '/project/create' : '/login'} onClick={() => setOpen(false)}><span className="companion-action-icon" aria-hidden="true">＋</span><span>프로젝트 등록하기</span><span className="companion-action-chevron" aria-hidden="true">›</span></Link>}
      <Link to="/service" onClick={() => setOpen(false)}><span className="companion-action-icon" aria-hidden="true">?</span><span>서비스 이용 안내</span><span className="companion-action-chevron" aria-hidden="true">›</span></Link>
    </div>
  ) : <div className="companion-action-hint" id={id} style={bounds} role="status">{welcome ? '저를 클릭하면 메시지와 프로젝트 등록을 이용할 수 있어요.' : hint}</div>, document.body);
}
