import {
  useId,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { FileText } from 'lucide-react';

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
  onDocumentClick,
  style,
  className = '',
}: ReportFolderProps) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const backGradientId = `${uid}-back`;
  const frontGradientId = `${uid}-front`;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (navigationTimer.current) clearTimeout(navigationTimer.current); }, []);
  const folderDocuments = documents.length ? documents : reportHref ? [{ id: 'main', title: '메인', href: reportHref }] : [];
  const mainDocument = folderDocuments.find(document => document.title === '메인');
  const detailDocument = folderDocuments.find(document => document.title === '상세');
  const hasDestination = Boolean(mainDocument || detailDocument);

  return (
    <article
      className={[
        'dv-folder',
        isOpen ? 'dv-folder--open' : '',
        selectedDocument ? 'dv-folder--selecting' : '',
        !hasDestination ? 'dv-folder--disabled' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      onKeyDown={event => { if (event.key === 'Escape' && isOpen) { setIsOpen(false); event.currentTarget.querySelector<HTMLButtonElement>('.dv-folder-cover')?.focus(); } }}
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

          <div className="dv-folder-papers" aria-label={name + ' 리포트 선택'} inert={!isOpen}>
            {[['메인', mainDocument], ['상세', detailDocument]].filter(([, doc]) => Boolean(doc)).map(([label, doc]) => {
              const document = typeof doc === 'object' ? doc : undefined;
              const title = String(label);
              return document ? <a key={title} className={`dv-folder-document ${selectedDocument === document.id ? 'dv-folder-document--selected' : ''}`} href={document.href} aria-label={name + ' ' + title + ' 리포트 보기'} onClick={event => {
                if (!onDocumentClick || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                if (navigationTimer.current) return;
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { onDocumentClick(document.href); return; }
                setSelectedDocument(document.id);
                navigationTimer.current = setTimeout(() => onDocumentClick(document.href), 460);
              }}><span className="dv-folder-document-icon" aria-hidden="true"><FileText size={20} /></span><strong>{title} 리포트</strong><span className="dv-folder-document-preview" aria-hidden="true" /><span className="dv-folder-document-skeleton" aria-hidden="true"><i /><i /><i /><i /></span></a> : <span key={title} className="dv-folder-document dv-folder-document--missing" aria-label={title + ' 리포트 없음'}><span className="dv-folder-document-icon" aria-hidden="true"><FileText size={20} /></span><strong>{title} 리포트</strong><span className="dv-folder-document-status">없음</span></span>;
            })}
          </div>

          <button
            type="button"
            className="dv-folder-cover"
            disabled={!hasDestination}
            aria-expanded={isOpen}
            aria-label={name + (isOpen ? ' 폴더 닫기' : ' 리포트 선택 열기')}
            onClick={() => setIsOpen(open => !open)}
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
                  stroke="#686a78"
                  strokeWidth="1.4"
                />
                <path
                  d="M 21 1 H 128 C 154 1 155 33 180 33"
                  fill="none"
                  stroke="#B3B0C3"
                  strokeWidth="0.9"
                  strokeOpacity="0.4"
                />
              </svg>
            </span>

            <span className="dv-folder-cover-content">
              <strong className="dv-folder-title" title={name}>
                {name}
              </strong>
              {date && <span className="dv-folder-date">{date}</span>}
            </span>
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
  max-width: 320px;
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
  top: 8%;
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
  border: 1px solid color-mix(in srgb, var(--project-accent) 32%, var(--surface-badge));
  border-radius: 14px;
  background: linear-gradient(160deg, color-mix(in srgb, var(--project-accent) 24%, var(--surface-badge)), color-mix(in srgb, var(--project-accent) 10%, var(--surface-input)));
  box-shadow: 0 -2px 6px rgba(0, 0, 0, .09);
  pointer-events: none;
  transform: translate3d(0,0,0);
  transition: transform 500ms cubic-bezier(.22,.61,.36,1);
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
  filter: drop-shadow(0 3px 3px rgba(0,0,0,.18)) drop-shadow(0 14px 16px rgba(0,0,0,.3));
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

.dv-folder-cover:focus-visible, .dv-folder-document:focus-visible {
  outline: 2px solid var(--dv-folder-focus);
  outline-offset: 3px;
  border-radius: 10px;
}
.dv-folder--disabled .dv-folder-cover { cursor: default; }
.dv-folder--disabled .dv-folder-front { opacity: .58; }
.dv-folder--disabled .dv-folder-title { opacity: .7; }

/* 정적인 상태에서도 레이어가 입체적이며, 호버는 2px만 상승 */
@media (hover: hover) and (pointer: fine) {
  .dv-folder:not(.dv-folder--open):not(.dv-folder--disabled):hover .dv-folder-stage {
    transform: translateY(-2px);
  }
  .dv-folder:not(.dv-folder--open):hover .dv-folder-front {
    filter: drop-shadow(0 4px 4px rgba(0,0,0,.2)) drop-shadow(0 17px 18px rgba(0,0,0,.34));
  }
}

/* 클릭: 앞면이 열리고 문서 한 장이 충분히 올라온 후 이동 */
.dv-folder--navigating .dv-folder-stage { transform: translate3d(0,0,0); transition-duration: 500ms; }
.dv-folder--navigating .dv-folder-cover {
  pointer-events: none;
  transform: translate3d(0,10px,0) rotateX(-48deg);
  transition: transform 580ms cubic-bezier(.22,.61,.36,1);
  will-change: transform;
}
.dv-folder--navigating .dv-folder-paper {
  transform: translate3d(0,-48%,0);
  transition-delay: 50ms;
}
.dv-folder-paper-rule {
  top: 24px;
  height: 4px;
  right: 24px;
  left: 24px;
  background: color-mix(in srgb, var(--text-secondary) 45%, transparent);
  box-shadow: 0 14px 0 color-mix(in srgb, var(--text-secondary) 26%, transparent), 0 28px 0 color-mix(in srgb, var(--text-secondary) 20%, transparent), 0 42px 0 color-mix(in srgb, var(--text-secondary) 14%, transparent);
}
@keyframes dv-paper-unfold {
  0% { transform: translate3d(0,0,0) scale(.98); opacity: 1; }
  50% { transform: translate3d(0,-38%,18px) scale(1.02); opacity: 1; }
  100% { transform: translate3d(0,-49%,32px) scale(1.13); opacity: .82; }
}
.dv-folder--navigating .dv-folder-cover-content { opacity: .15; }
@media (prefers-reduced-motion: reduce) {
  .dv-folder *, .dv-folder *::before, .dv-folder *::after {
    transition-duration: .01ms !important;
    animation-duration: .01ms !important;
  }
}

/* 메인 문서와 상세 문서를 겹쳐 각각 선택합니다. */
.dv-folder-papers {position:absolute;z-index:7;top:13%;left:12%;right:12%;height:68%;opacity:0;transform:translateY(18%) scale(.94);pointer-events:none;transition:transform 480ms cubic-bezier(.2,.7,.2,1),opacity 180ms ease;}
.dv-folder--open {z-index:10;}
.dv-folder--open .dv-folder-papers {opacity:1;transform:translateY(-40%) scale(1);pointer-events:auto;}
.dv-folder-document {position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:flex-start;min-width:0;padding:13px 16px;border:1px solid color-mix(in srgb,var(--project-accent) 22%,var(--surface-badge));border-radius:9px;background:linear-gradient(155deg,color-mix(in srgb,var(--project-accent) 10%,var(--surface-badge)),var(--surface-input));color:var(--text-main);text-decoration:none;box-shadow:0 8px 18px color-mix(in srgb,var(--surface-page) 65%,transparent);transition:transform 180ms ease,border-color 180ms ease,background 180ms ease;}
.dv-folder-document:nth-child(1) {top:42px;z-index:2;}
.dv-folder-document:nth-child(2) {top:0;z-index:1;flex-direction:row;align-items:flex-start;gap:8px;background:color-mix(in srgb,var(--project-accent) 20%,var(--surface-badge));}
.dv-folder-document strong {margin-top:auto;font-size:15px;font-weight:650;line-height:1.35;letter-spacing:-.02em;}
.dv-folder-document > span:last-child {margin-top:4px;color:var(--text-secondary);font-size:11px;line-height:1.4;}
.dv-folder-document-icon {display:grid;place-items:center;width:31px;height:31px;border:1px solid color-mix(in srgb,var(--project-accent) 24%,transparent);border-radius:7px;background:color-mix(in srgb,var(--project-accent) 9%,transparent);color:var(--project-accent);}
.dv-folder-document-icon svg {width:16px;height:16px;stroke-width:1.7;}
.dv-folder-document:nth-child(2) .dv-folder-document-icon {width:18px;height:18px;border:0;background:none;}
.dv-folder-document:nth-child(2) strong {margin:0;font-size:12px;}
.dv-folder-document:nth-child(2) > span:last-child {margin:0 0 0 auto;font-size:11px;}
.dv-folder-document:not(.dv-folder-document--missing):hover {transform:translateY(-4px);border-color:var(--project-control-border);}
.dv-folder-document--missing {opacity:.55;cursor:default;box-shadow:none;}
.dv-folder--open .dv-folder-cover {transform:translate3d(0,12px,0) rotateX(-26deg);transition:transform 480ms cubic-bezier(.2,.7,.2,1);}
.dv-folder--open .dv-folder-cover-content {opacity:.7;}
@media(prefers-reduced-motion:reduce) {.dv-folder-papers,.dv-folder--open .dv-folder-cover {transition:none;}}

/* 열린 폴더의 앞면 뒤에 두 리포트가 겹쳐 보입니다. */
.dv-folder--open .dv-folder-cover {z-index:8;transform:translate3d(0,8px,0) rotateX(-14deg);}
.dv-folder--open .dv-folder-cover-content {opacity:1;}
.dv-folder-papers {z-index:7;left:9%;right:9%;height:75%;}
.dv-folder--open .dv-folder-papers {transform:translateY(-48%) scale(1);}
.dv-folder-document,.dv-folder-document:nth-child(1),.dv-folder-document:nth-child(2) {display:flex;flex-direction:row;align-items:flex-start;justify-content:flex-start;gap:9px;padding:12px 14px;color:var(--text-main);}
.dv-folder-document:nth-child(1) {top:0;left:6%;right:2%;z-index:1;background:var(--surface-image);}
.dv-folder-document:nth-child(2) {top:40px;left:1%;right:6%;z-index:2;background:linear-gradient(180deg,color-mix(in srgb,var(--project-accent) 17%,var(--surface-image)),var(--surface-input));}
.dv-folder-document strong,.dv-folder-document:nth-child(2) strong {margin:1px 0 0;font-size:13px;font-weight:650;line-height:1.4;}
.dv-folder-document-icon,.dv-folder-document:nth-child(2) .dv-folder-document-icon {width:20px;height:20px;border:0;border-radius:0;background:none;flex:none;color:var(--project-accent);}
.dv-folder-document-preview {position:absolute;top:42px;left:12px;right:12px;height:1px;background:var(--project-accent);opacity:.65;pointer-events:none;}
.dv-folder-document:nth-child(1) .dv-folder-document-preview {background:var(--project-divider);}
.dv-folder-document-status,.dv-folder-document:nth-child(2) .dv-folder-document-status {margin:2px 0 0 auto;color:var(--text-secondary);font-size:10px;}
.dv-folder-document:not(.dv-folder-document--missing):hover,.dv-folder-document:focus-visible {transform:translateY(-3px);z-index:3;}
.dv-folder-document--missing {opacity:.65;}

.dv-folder-document-skeleton,.dv-folder-document:nth-child(2) .dv-folder-document-skeleton {position:absolute;top:54px;left:16px;right:16px;display:grid;grid-template-columns:20px minmax(0,1fr);gap:6px 9px;margin:0;pointer-events:none;}
.dv-folder-document-skeleton i {display:block;height:5px;border-radius:3px;background:color-mix(in srgb,var(--text-secondary) 18%,transparent);}
.dv-folder-document-skeleton i:first-child {grid-row:span 3;height:20px;border-radius:4px;background:color-mix(in srgb,var(--text-secondary) 16%,transparent);}
.dv-folder-document-skeleton i:nth-child(2) {width:85%;}
.dv-folder-document-skeleton i:nth-child(3) {width:58%;}
.dv-folder-document-skeleton i:nth-child(4) {width:72%;}

/* 마우스 클릭 시 공통 버튼 눌림 효과와 포커스 테두리가 폴더 면에 겹치지 않도록 합니다. */
.report-library .dv-folder-cover:focus:not(:focus-visible) {outline:none;}
.report-library .dv-folder-cover:active {transform:translate3d(0,0,0) rotateX(0);}
.report-library .dv-folder--open .dv-folder-cover:active {transform:translate3d(0,8px,0) rotateX(-14deg);}

.dv-folder--selecting .dv-folder-papers {pointer-events:none;}
.dv-folder--selecting .dv-folder-document:not(.dv-folder-document--selected) {animation:dv-document-tuck 420ms cubic-bezier(.22,.7,.2,1) both;}
.dv-folder--selecting .dv-folder-document.dv-folder-document--selected {z-index:9;animation:dv-document-select 460ms cubic-bezier(.22,.75,.2,1) both;}
.dv-folder--selecting .dv-folder-cover {pointer-events:none;animation:dv-folder-settle 460ms ease both;}
@keyframes dv-document-tuck {to {transform:translate3d(0,26px,0) scale(.96);opacity:.25;}}
@keyframes dv-document-select {0% {transform:translateY(0) scale(1);} 35% {transform:translate3d(0,5px,0) scale(.98);} 100% {transform:translate3d(0,-20px,28px) scale(1.045);opacity:.86;}}
@keyframes dv-folder-settle {to {transform:translate3d(0,3px,0) rotateX(-5deg);}}

`;
