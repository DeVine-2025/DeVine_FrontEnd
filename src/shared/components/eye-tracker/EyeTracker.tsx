import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './eye-tracker.css';

const SHAPES = {
  Ball: 'M50 0 A50 50 0 1 1 49.99 0 Z',
  Cube: 'M30 6 H70 A24 24 0 0 1 94 30 V70 A24 24 0 0 1 70 94 H30 A24 24 0 0 1 6 70 V30 A24 24 0 0 1 30 6 Z',
  Pill: 'M34 17 H66 A33 33 0 0 1 66 83 H34 A33 33 0 0 1 34 17 Z',
  Hexagon: 'M59.53 8.50 L81.18 21.00 Q90.70 26.50 90.70 37.50 L90.70 62.50 Q90.70 73.50 81.18 79.00 L59.53 91.50 Q50.00 97.00 40.47 91.50 L18.82 79.00 Q9.30 73.50 9.30 62.50 L9.30 37.50 Q9.30 26.50 18.82 21.00 L40.47 8.50 Q50.00 3.00 59.53 8.50 Z',
};
const EYES = {
  Slant: { w: 9, h: 15, r: 4.5 },
  Dots: { w: 11, h: 11, r: 5.5 },
  Squares: { w: 12, h: 12, r: 3.5 },
};
export type EyeTrackerProps = {
  shape?: keyof typeof SHAPES;
  eyes?: keyof typeof EYES;
  fill?: 'dark' | 'light' | 'purple';
  size?: number;
  follow?: number;
  bounce?: number;
  idle?: boolean;
};
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const lines = ['안녕하세요!', '여기 보고 있어요.', '반가워요!', '아이디어가 떠올랐나요?', '같이 만들어 볼까요?'];
const radii = new Map<string, number[]>();

function measure(shape: keyof typeof SHAPES) {
  const cached = radii.get(shape);
  if (cached) return cached;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const path = document.createElementNS(svg.namespaceURI, 'path') as SVGPathElement;
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  path.setAttribute('d', SHAPES[shape]);
  svg.appendChild(path);
  document.body.appendChild(svg);
  const point = svg.createSVGPoint();
  const values = Array.from({ length: 120 }, (_, i) => {
    const angle = i / 120 * Math.PI * 2 - Math.PI / 2;
    let lo = 0;
    let hi = 60;
    for (let k = 0; k < 16; k++) {
      const mid = (lo + hi) / 2;
      point.x = 50 + Math.cos(angle) * mid;
      point.y = 50 + Math.sin(angle) * mid;
      if (path.isPointInFill(point)) lo = mid;
      else hi = mid;
    }
    return lo;
  });
  svg.remove();
  radii.set(shape, values);
  return values;
}

function outline(values: number[]) {
  return values.map((radius, i) => {
    const angle = i / values.length * Math.PI * 2 - Math.PI / 2;
    return `${i ? 'L' : 'M'}${(50 + Math.cos(angle) * radius).toFixed(2)} ${(50 + Math.sin(angle) * radius).toFixed(2)}`;
  }).join('') + 'Z';
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    update();
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** Independent SVG character. Sphere projection follows the supplied Bencho Watcher reference. */
export function EyeTracker({ shape = 'Cube', eyes = 'Slant', fill = 'dark', size = 100, follow = 30, bounce = 30, idle = false }: EyeTrackerProps) {
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const eyeRefs = useRef<(SVGGElement | null)[]>([]);
  const body = useRef<SVGPathElement>(null);
  const clip = useRef<SVGPathElement>(null);
  const clipId = `eye-tracker-${useId().replace(/:/g, '')}`;
  const settings = useRef({ follow, bounce, eyes });
  const wake = useRef<() => void>(() => {});
  const [message, setMessage] = useState('');
  const [talking, setTalking] = useState(false);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const previousLine = useRef(-1);
  const shownShape = useRef<number[] | null>(null);
  const previousShape = useRef(shape);

  useLayoutEffect(() => {
    settings.current = { follow, bounce, eyes };
    wake.current();
  }, [follow, bounce, eyes]);

  useEffect(() => () => clearTimeout(messageTimer.current), []);

  const greet = () => {
    clearTimeout(messageTimer.current);
    const choices = lines.map((_, i) => i).filter(i => i !== previousLine.current);
    const index = choices[Math.floor(Math.random() * choices.length)];
    previousLine.current = index;
    const line = lines[index];
    setMessage(reduced ? line : '');
    setTalking(true);
    let count = 0;
    const type = () => {
      count++;
      setMessage(line.slice(0, count));
      messageTimer.current = setTimeout(count < line.length ? type : () => setTalking(false), count < line.length ? 48 : 1800);
    };
    messageTimer.current = setTimeout(reduced ? () => setTalking(false) : type, reduced ? 1800 : 48);
  };

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const turn = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
    let raf = 0;
    let previousTime = 0;
    let blinkStart = -Infinity;
    let visible = true;
    let blinkTimer: ReturnType<typeof setTimeout> | undefined;
    let glanceTimer: ReturnType<typeof setTimeout> | undefined;
    let returnTimer: ReturnType<typeof setTimeout> | undefined;

    const draw = (now: number) => {
      const yaw = Math.asin(clamp(turn.x, -.92, .92));
      const pitch = -Math.asin(clamp(turn.y, -.92, .92));
      const age = now - blinkStart;
      const lid = age >= 0 && age < 160 ? 1 - .9 * Math.sin(age / 160 * Math.PI) : 1;
      const style = EYES[settings.current.eyes];
      [-.19, .19].forEach((x0, i) => {
        const group = eyeRefs.current[i];
        const rect = group?.firstElementChild;
        if (!group || !rect) return;
        const z0 = Math.sqrt(1 - x0 * x0);
        const x1 = x0 * Math.cos(yaw) + z0 * Math.sin(yaw);
        const z1 = -x0 * Math.sin(yaw) + z0 * Math.cos(yaw);
        const y2 = -z1 * Math.sin(pitch);
        const z2 = z1 * Math.cos(pitch);
        const near = clamp(z2, 0, 1);
        const k = .45 + .55 * near;
        const width = style.w * k * (.7 + .3 * near);
        const height = Math.max(.6, style.h * k * lid);
        rect.setAttribute('x', String(-width / 2));
        rect.setAttribute('y', String(-height / 2));
        rect.setAttribute('width', String(width));
        rect.setAttribute('height', String(height));
        rect.setAttribute('rx', String(Math.min(style.r, width / 2, height / 2)));
        group.setAttribute('transform', `translate(${50 + x1 * 50} ${50 + y2 * 50}) rotate(${64 * turn.x * turn.y})`);
        group.style.opacity = z2 < .05 ? '0' : '1';
      });
    };
    const tick = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) { previousTime = 0; return; }
      const dt = previousTime ? Math.min(2.5, (now - previousTime) / 16.67) : 1;
      previousTime = now;
      const damping = .34 - clamp(settings.current.bounce, 0, 100) / 100 * .22;
      turn.vx += ((turn.tx - turn.x) * .06 - turn.vx * damping) * dt;
      turn.vy += ((turn.ty - turn.y) * .06 - turn.vy * damping) * dt;
      turn.x += turn.vx * dt;
      turn.y += turn.vy * dt;
      draw(now);
      const moving = Math.abs(turn.tx - turn.x) + Math.abs(turn.ty - turn.y) + Math.abs(turn.vx) + Math.abs(turn.vy) > .0001;
      if (moving || now - blinkStart < 160) raf = requestAnimationFrame(tick);
      else previousTime = 0;
    };
    const resume = () => {
      if (!reduced && !raf && visible && !document.hidden) raf = requestAnimationFrame(tick);
      else if (reduced) draw(performance.now());
    };
    wake.current = resume;
    const rest = () => { turn.tx = 0; turn.ty = 0; resume(); };
    const aim = (event: PointerEvent) => {
      if (reduced || idle) return;
      const rect = element.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy) || 1;
      const reach = Math.max(60, Math.min(window.innerWidth, window.innerHeight) * .28);
      const far = Math.min(.85, Math.tanh(distance / reach) * clamp(settings.current.follow, 0, 100) / 100 * 1.5);
      turn.tx = dx / distance * far;
      turn.ty = dy / distance * far;
      resume();
    };
    const scheduleBlink = () => {
      blinkTimer = setTimeout(() => {
        if (visible && !document.hidden) { blinkStart = performance.now(); resume(); }
        scheduleBlink();
      }, 2600 + Math.random() * 3200);
    };
    const glance = () => {
      glanceTimer = setTimeout(() => {
        if (visible && !document.hidden) {
          const angle = Math.random() * Math.PI * 2;
          turn.tx = Math.cos(angle) * .45;
          turn.ty = Math.sin(angle) * .45;
          resume();
          returnTimer = setTimeout(rest, 900);
        }
        glance();
      }, 5000);
    };
    draw(performance.now());
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) { cancelAnimationFrame(raf); raf = 0; previousTime = 0; }
      else resume();
    });
    observer.observe(element);
    if (!reduced) { scheduleBlink(); if (idle) glance(); }
    window.addEventListener('pointermove', aim, { passive: true });
    window.addEventListener('blur', rest);
    document.documentElement.addEventListener('pointerleave', rest);
    document.addEventListener('visibilitychange', resume);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(blinkTimer);
      clearTimeout(glanceTimer);
      clearTimeout(returnTimer);
      observer.disconnect();
      window.removeEventListener('pointermove', aim);
      window.removeEventListener('blur', rest);
      document.documentElement.removeEventListener('pointerleave', rest);
      document.removeEventListener('visibilitychange', resume);
      wake.current = () => {};
    };
  }, [reduced, idle]);

  useLayoutEffect(() => {
    const start = shownShape.current ?? measure(previousShape.current);
    const end = measure(shape);
    const changed = previousShape.current !== shape;
    previousShape.current = shape;
    const started = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const progress = reduced || !changed ? 1 : Math.min(1, (now - started) / 520);
      const eased = 1 + 2.3 * (progress - 1) ** 3 + 1.3 * (progress - 1) ** 2;
      shownShape.current = start.map((value, i) => value + (end[i] - value) * eased);
      const path = outline(shownShape.current);
      body.current?.setAttribute('d', path);
      clip.current?.setAttribute('d', path);
      if (progress < 1) raf = requestAnimationFrame(frame);
    };
    frame(started);
    return () => cancelAnimationFrame(raf);
  }, [shape, reduced]);

  return (
    <div className="eye-tracker" data-fill={fill} ref={root} style={{ width: clamp(size, 60, 180), height: clamp(size, 60, 180) }}>
      <button type="button" className="eye-tracker-character" aria-label="눈 추적 캐릭터와 인사하기" onClick={greet}>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <defs><clipPath id={clipId}><path ref={clip} d={SHAPES[shape]} /></clipPath></defs>
          <path className="eye-tracker-body" ref={body} d={SHAPES[shape]} />
          <g clipPath={`url(#${clipId})`}>
            {[0, 1].map(i => <g key={i} ref={node => { eyeRefs.current[i] = node; }}><rect className="eye-tracker-eye" width="9" height="15" rx="4.5" /></g>)}
          </g>
        </svg>
      </button>
      <span className="eye-tracker-message" data-open={talking} aria-hidden="true">{message || '\u00a0'}</span>
      <span className="eye-tracker-sr" role="status">{talking ? lines[previousLine.current] : ''}</span>
    </div>
  );
}

const initial: Required<EyeTrackerProps> = { shape: 'Cube', eyes: 'Slant', fill: 'dark', size: 100, follow: 30, bounce: 30, idle: false };

export default function EyeTrackerWidget() {
  const [options, setOptions] = useState(initial);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  return createPortal(
    <div className="eye-tracker-widget" ref={root} data-settings-open={open}>
      <EyeTracker {...options} />
      <button className="eye-tracker-settings" type="button" ref={trigger} aria-label="눈 추적 캐릭터 설정" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(value => !value)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="3" /><circle cx="15" cy="17" r="3" /></svg>
      </button>
      {open && (
        <section className="eye-tracker-panel" id={panelId} aria-label="눈 추적 캐릭터 설정">
          <div className="eye-tracker-panel-heading"><strong>Eye tracker</strong><button type="button" aria-label="설정 닫기" onClick={() => { setOpen(false); trigger.current?.focus(); }}>×</button></div>
          <p>마우스를 따라 시선이 움직여요.<br />캐릭터를 눌러 인사해 보세요.</p>
          <fieldset><legend>색상</legend><div className="eye-tracker-choices">{(['dark', 'light', 'purple'] as const).map((fill, i) => <label key={fill}><input type="radio" name={`${panelId}-fill`} value={fill} checked={options.fill === fill} onChange={() => setOptions(value => ({ ...value, fill }))} /><span>{['다크', '라이트', '보라'][i]}</span></label>)}</div></fieldset>
          <fieldset><legend>모양</legend><div className="eye-tracker-choices">{(['Cube', 'Ball', 'Pill', 'Hexagon'] as const).map((shape, i) => <label key={shape}><input type="radio" name={`${panelId}-shape`} value={shape} checked={options.shape === shape} onChange={() => setOptions(value => ({ ...value, shape }))} /><span>{['사각', '원', '캡슐', '육각'][i]}</span></label>)}</div></fieldset>
          <fieldset><legend>눈</legend><div className="eye-tracker-choices">{(['Slant', 'Dots', 'Squares'] as const).map((eyes, i) => <label key={eyes}><input type="radio" name={`${panelId}-eyes`} value={eyes} checked={options.eyes === eyes} onChange={() => setOptions(value => ({ ...value, eyes }))} /><span>{['타원', '동그라미', '사각'][i]}</span></label>)}</div></fieldset>
          {(['follow', 'bounce', 'size'] as const).map((key, i) => <label className="eye-tracker-range" key={key}><span>{['시선 반응', '탄성', '크기'][i]}<output>{options[key]}{key === 'size' ? 'px' : ''}</output></span><input type="range" min={key === 'size' ? 60 : 0} max={key === 'size' ? 160 : 100} value={options[key]} onChange={event => setOptions(value => ({ ...value, [key]: Number(event.target.value) }))} /></label>)}
          <label className="eye-tracker-idle"><input type="checkbox" checked={options.idle} onChange={event => setOptions(value => ({ ...value, idle: event.target.checked }))} />혼자 둘러보기</label>
          <button type="button" className="eye-tracker-reset" onClick={() => setOptions(initial)}>기본값으로 되돌리기</button>
        </section>
      )}
    </div>,
    document.body,
  );
}
