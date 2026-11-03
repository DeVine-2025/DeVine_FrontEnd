import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react';

/** 기존 호출부와 호환하기 위해 유지하는 문서 타입입니다. */
export type FolderDocument = {
  id: string;
  title: string;
  description?: string;
  href: string;
};

export type ReportFolderProps = {
  name: string;
  /** 폴더 전면에 표시할 날짜. 예: '2026.10.05' */
  date?: string;
  /** 이동할 기본 리포트 경로. 가능하면 명시적으로 전달하세요. */
  reportHref?: string;
  /** 이전 컴포넌트와의 호환용. 리포트 2장 UI는 더 이상 그리지 않습니다. */
  documents?: FolderDocument[];
  favorite?: boolean;
  onFavoriteChange?: (favorite: boolean) => void;
  /** React Router의 navigate 등을 연결하는 기존 콜백. */
  onDocumentClick?: (href: string) => void;
  style?: CSSProperties;
  className?: string;
};

// 원본 폴더에서 사용하던 실루엣을 SVG viewBox로 유지합니다.
// SVG는 카드 크기에 따라 비율을 유지하며 축소됩니다.
const BACK_PATH =
  'M 19 36 H 140 C 163 36 166 0 189 0 H 317 Q 340 0 340 23 V 198 Q 340 218 318 218 H 21 Q 0 218 0 198 V 57 Q 0 36 19 36 Z';
const FRONT_PATH =
  'M 21 0 H 128 C 154 0 155 32 180 32 H 316 Q 340 32 340 55 V 195 Q 340 218 317 218 H 23 Q 0 218 0 195 V 23 Q 0 0 21 0 Z';

const TRANSITION_MS = 1050;

/**
 * DeVine — Sculpted Layer Folder
 *
 * 닫힌 폴더: 프로젝트명 + 날짜만 표시
 * 클릭: 살짝 눌림 → 앞면 열림 + 종이 한 장 상승 → 리포트로 이동
 * 즐겨찾기: 별도 버튼으로 동작하며 리포트로 이동하지 않음
 *
 * 같은 프로젝트가 목록에 두 번 나타나면, 이 컴포넌트가 아니라
 * 부모 목록에서 저장소 ID로 중복 데이터를 제거해야 합니다.
 */
export default function ReportFolder({
  name,
  date,
  reportHref,
  documents = [],
  favorite: controlledFavorite,
  onFavoriteChange,
  onDocumentClick,
  style,
  className = '',
}: ReportFolderProps) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const backGradientId = `${uid}-back`;
  const frontGradientId = `${uid}-front`;

  const [isNavigating, setIsNavigating] = useState(false);
  const [localFavorite, setLocalFavorite] = useState(false);
  const navigationPending = useRef(false);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFavorite = controlledFavorite ?? localFavorite;

  // reportHref가 최우선. 미전달 시 구형 호출부의 첫 문서 링크를 이용합니다.
  // 복수 문서라면 명확한 기본 진입점(reportHref)을 부모에서 지정하는 것이 안전합니다.
  const destination = reportHref || documents[0]?.href || '';
  const hasDestination = destination.trim().length > 0;

  useEffect(() => {
    return () => {
      if (navigationTimer.current !== null) {
        clearTimeout(navigationTimer.current);
      }
    };
  }, []);

  const toggleFavorite = () => {
    if (navigationPending.current) return;
    const next = !isFavorite;
    if (controlledFavorite === undefined) setLocalFavorite(next);
    onFavoriteChange?.(next);
  };

  const goToReport = (href: string) => {
    if (onDocumentClick) {
      onDocumentClick(href);
      return;
    }
    window.location.assign(href);
  };

  const handleReportClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!hasDestination || event.defaultPrevented) {
      event.preventDefault();
      return;
    }

    // 새 탭 / 새 창 / 보조 클릭 등 기본 링크 동작을 그대로 유지합니다.
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    if (navigationPending.current) return;
    navigationPending.current = true;

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      goToReport(destination);
      return;
    }

    setIsNavigating(true);
    navigationTimer.current = setTimeout(() => {
      navigationTimer.current = null;
      goToReport(destination);
    }, TRANSITION_MS);
  };

  return (
    <article
      className={[
        'dv-folder',
        isNavigating ? 'dv-folder--navigating' : '',
        !hasDestination ? 'dv-folder--disabled' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {/* 별도 CSS나 아이콘 라이브러리가 필요 없는 단일 TSX 파일입니다. */}
      <style>{folderStyles}</style>

      <div className="dv-folder-scene">
        <div className="dv-folder-stage">
          {/* 단정한 낮은 채도 보라색 폴더 뒷면 */}
          <div className="dv-folder-back" aria-hidden="true">
            <svg viewBox="0 0 340 218" preserveAspectRatio="none" focusable="false">
              <defs>
                <linearGradient
                  id={backGradientId}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#7069B4" />
                  <stop offset="100%" stopColor="#49456F" />
                </linearGradient>
              </defs>
              <path
                d={BACK_PATH}
                fill={`url(#${backGradientId})`}
                stroke="#8A83BB"
                strokeWidth="0.85"
                strokeOpacity="0.55"
              />
            </svg>
          </div>

          {/* 내부에 들어 있는 문서는 '한 장'만 시각적으로 표현 */}
          <div className="dv-folder-paper" aria-hidden="true">
            <span className="dv-folder-paper-rule" />
          </div>

          {/* 폴더 전체 클릭: 펼친 두 문서 선택 없이 리포트로 바로 이동 */}
          <a
            className="dv-folder-cover"
            href={hasDestination ? destination : undefined}
            tabIndex={hasDestination ? 0 : -1}
            aria-disabled={!hasDestination || undefined}
            aria-label={`${name} 리포트 보기`}
            onClick={handleReportClick}
          >
            <span className="dv-folder-front" aria-hidden="true">
              <svg viewBox="0 0 340 218" preserveAspectRatio="none" focusable="false">
                <defs>
                  <linearGradient
                    id={frontGradientId}
                    x1="0"
                    y1="0"
                    x2="0.95"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#2A2B36" />
                    <stop offset="58%" stopColor="#242630" />
                    <stop offset="100%" stopColor="#1C1E27" />
                  </linearGradient>
                </defs>
                <path
                  d={FRONT_PATH}
                  fill={`url(#${frontGradientId})`}
                  stroke="#424452"
                  strokeWidth="1"
                />
                <path
                  d="M 21 1 H 128 C 154 1 155 33 180 33"
                  fill="none"
                  stroke="#B3B0C3"
                  strokeWidth="0.9"
                  strokeOpacity="0.25"
                />
              </svg>
            </span>

            <span className="dv-folder-cover-content">
              <strong className="dv-folder-title" title={name}>
                {name}
              </strong>
              {date && <span className="dv-folder-date">{date}</span>}
            </span>
          </a>

          {/* 즐겨찾기는 링크 안에 중첩하지 않는 독립 버튼 */}
          <button
            type="button"
            className="dv-folder-favorite"
            aria-label={`${name} ${isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}`}
            aria-pressed={isFavorite}
            disabled={isNavigating}
            onClick={toggleFavorite}
          >
            <svg
              viewBox="0 0 24 24"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="m12 3 2.78 5.63L21 9.54l-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.93 1.06-6.2L3 9.54l6.22-.91L12 3Z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

const folderStyles = String.raw`
.dv-folder {
  --dv-folder-text: #f2f4fc;
  --dv-folder-muted: #9ea6ba;
  --dv-folder-focus: var(--color-primary, #4e49ff);
  position: relative;
  width: 100%;
  max-width: 355px;
  margin-inline: auto;
  padding-top: 28px;
  color: var(--dv-folder-text);
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.dv-folder *, .dv-folder *::before, .dv-folder *::after {
  box-sizing: border-box;
}
.dv-folder-scene {
  width: 100%;
  aspect-ratio: 340 / 254;
  perspective: 1050px;
}
.dv-folder-stage {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 200ms ease;
}

/* 3D 깊이는 레이어 위치와 은은한 그림자만으로 표현합니다. */
.dv-folder-back {
  position: absolute;
  top: 1.5%;
  left: 0;
  z-index: 0;
  width: 100%;
  height: 85.8%;
  pointer-events: none;
}
.dv-folder-back svg, .dv-folder-front svg {
  display: block;
  width: 100%;
  height: 100%;
}
.dv-folder-paper {
  position: absolute;
  z-index: 2;
  top: 13.4%;
  left: 10%;
  width: 81%;
  height: 66%;
  overflow: hidden;
  border: 1px solid rgba(230, 226, 255, .24);
  border-radius: 14px;
  background: linear-gradient(160deg, #efedf8, #c9c3e1);
  box-shadow: 0 -2px 6px rgba(0, 0, 0, .09);
  pointer-events: none;
  transform: translate3d(0,0,0);
  transition: transform 820ms cubic-bezier(.22,.61,.36,1);
  will-change: transform;
}
.dv-folder-paper-rule {
  position: absolute;
  top: 9px;
  right: 13px;
  left: 13px;
  height: 1px;
  background: rgba(255, 255, 255, .18);
}

/* 링크는 폴더 앞면 전체가 됩니다. 별도의 화살표/큰 버튼은 없습니다. */
.dv-folder-cover {
  position: absolute;
  z-index: 5;
  top: 13%;
  left: 0;
  display: block;
  width: 100%;
  height: 85.8%;
  border: 0;
  padding: 0;
  color: inherit;
  text-decoration: none;
  background: transparent;
  cursor: pointer;
  transform: translateY(0) rotateX(0deg);
  transform-origin: 50% 95%;
  transition: transform 200ms ease;
  -webkit-tap-highlight-color: transparent;
}
.dv-folder-front {
  position: absolute;
  inset: 0;
  filter: drop-shadow(0 12px 14px rgba(0,0,0,.21));
  pointer-events: none;
  transition: filter 200ms ease;
}
.dv-folder-cover-content {
  position: absolute;
  right: 7.7%;
  bottom: 12.6%;
  left: 8%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
  pointer-events: none;
  backface-visibility: hidden;
  transition: opacity 180ms ease;
}
.dv-folder-title {
  display: block;
  max-width: 100%;
  overflow: hidden;
  color: var(--dv-folder-text);
  font-size: clamp(17px, 5vw, 19px);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -.035em;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dv-folder-date {
  color: var(--dv-folder-muted);
  font-size: 12px;
  line-height: 1.45;
  letter-spacing: 0;
}

/* 포커스 및 즐겨찾기: 색은 절제하고 클릭 영역은 충분히 확보 */
.dv-folder-favorite {
  position: absolute;
  z-index: 8;
  top: 31%;
  right: 6%;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #aeb0c1;
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease, opacity 160ms ease;
}
.dv-folder-favorite svg { display: block; width: 18px; height: 18px; }
.dv-folder-favorite:hover { background: rgba(255,255,255,.07); color: #f2f4fc; }
.dv-folder-favorite[aria-pressed="true"] { color: #aca3ff; }
.dv-folder-cover:focus-visible, .dv-folder-favorite:focus-visible {
  outline: 2px solid var(--dv-folder-focus);
  outline-offset: 3px;
  border-radius: 10px;
}
.dv-folder--disabled .dv-folder-cover { cursor: default; }
.dv-folder--disabled .dv-folder-front { opacity: .58; }
.dv-folder--disabled .dv-folder-title { opacity: .7; }

/* 정적인 상태에서도 레이어가 입체적이며, 호버는 2px만 상승 */
@media (hover: hover) and (pointer: fine) {
  .dv-folder:not(.dv-folder--navigating):not(.dv-folder--disabled):hover .dv-folder-stage {
    transform: translateY(-2px);
  }
  .dv-folder:not(.dv-folder--navigating):hover .dv-folder-front {
    filter: drop-shadow(0 14px 16px rgba(0,0,0,.24));
  }
}

/* 클릭: 앞면이 열리고 문서 한 장이 충분히 올라온 후 이동 */
.dv-folder--navigating .dv-folder-stage { transform: translate3d(0,0,0); transition-duration: 820ms; }
.dv-folder--navigating .dv-folder-cover {
  pointer-events: none;
  transform: translate3d(0,10px,0) rotateX(-48deg);
  transition: transform 820ms cubic-bezier(.22,.61,.36,1);
  will-change: transform;
}
.dv-folder--navigating .dv-folder-paper {
  transform: translate3d(0,-48%,0);
  transition-delay: 90ms;
}
.dv-folder-paper-rule {
  top: 24px;
  height: 4px;
  right: 24px;
  left: 24px;
  background: #776d9c55;
  box-shadow: 0 14px 0 #776d9c33, 0 28px 0 #776d9c33, 0 42px 0 #776d9c22;
}
.dv-folder--navigating .dv-folder-cover-content { opacity: .15; }
.dv-folder--navigating .dv-folder-favorite { opacity: 0; pointer-events: none; }
@media (prefers-reduced-motion: reduce) {
  .dv-folder *, .dv-folder *::before, .dv-folder *::after {
    transition-duration: .01ms !important;
    animation-duration: .01ms !important;
  }
}
`;
