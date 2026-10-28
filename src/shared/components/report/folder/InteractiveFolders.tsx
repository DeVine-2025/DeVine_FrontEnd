import { useEffect, useState, type PointerEvent } from 'react';
import './InteractiveFolders.css';

export type FolderData = {
  id: string;
  name: string;
  detail: string;
  category: string;
  variant: 'ice' | 'lilac' | 'ember';
  papers: string[];
  documents?: { id: string; title: string; description?: string; to: string }[];
};

const folders: FolderData[] = [
  {
    id: 'personal',
    name: 'My Files',
    detail: 'Just now',
    category: 'PERSONAL',
    variant: 'ice',
    papers: ['IDEAS / 24', 'DRAFTS', 'NOTES'],
  },
  {
    id: 'archive',
    name: 'Archives',
    detail: '4 items',
    category: 'HISTORY',
    variant: 'lilac',
    papers: ['2024', '2025', '2026'],
  },
  {
    id: 'visual',
    name: 'Inspiration',
    detail: 'Wed 28 Oct',
    category: 'VISUALS',
    variant: 'ember',
    papers: ['MOODBOARD', 'REFERENCES', 'VISUALS'],
  },
];

function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
  if (event.pointerType === 'touch') return;
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  element.style.setProperty('--rx', `${(-y * 9).toFixed(2)}deg`);
  element.style.setProperty('--ry', `${(x * 13).toFixed(2)}deg`);
}

function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
  event.currentTarget.style.setProperty('--rx', '0deg');
  event.currentTarget.style.setProperty('--ry', '0deg');
}

/**
 * Dependency-free React/CSS folder animation.
 * To use only one folder, replace the `folders` array with your own entry.
 */
export default function InteractiveFolders({ items = folders, embedded = false, onDocumentClick }: { items?: FolderData[]; embedded?: boolean; onDocumentClick?: (to: string) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`if-root${embedded ? ' if-embedded' : ''}`}>
      <div className="if-shell">
        <header className="if-header">
          <div className="if-brand"><span className="if-brand-icon" aria-hidden="true" />FOLD / 01</div>
          <span className="if-top-note">INTERACTIVE COMPONENT STUDY — 2026</span>
        </header>

        <section className="if-intro">
          <div className="if-eyebrow">Material · Motion · Depth</div>
          <h1>Folders, brought to life.</h1>
          <p className="if-subtitle">마우스를 움직이면 기울고, 클릭하면 앞면이 열려 내부 파일이 펼쳐집니다.</p>
        </section>

        <section className="if-folder-grid" aria-label="인터랙티브 폴더 데모">
          {items.map((folder, index) => {
            const isOpen = openId === folder.id;
            return (
              <article className={`if-folder-cell if-variant-${folder.variant}`} key={folder.id}>
                <div
                  className={`if-folder-button${isOpen ? ' if-is-open' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  aria-label={`${folder.name} 폴더 ${isOpen ? '닫기' : '열기'}`}
                  onClick={() => setOpenId(isOpen ? null : folder.id)}
                  onKeyDown={event => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setOpenId(isOpen ? null : folder.id); }
                  }}
                  onPointerMove={handlePointerMove}
                  onPointerLeave={handlePointerLeave}
                >
                  <div className="if-folder-perspective">
                    <div className="if-folder-stage">
                      <div className="if-back" />
                      <div className="if-inner-pocket" />
                      {folder.papers.map((title, paperIndex) => (
                        <div key={`${paperIndex}-${title}`} className={`if-paper if-paper--${'abc'[paperIndex]}`}
                          role={folder.documents?.[paperIndex] ? 'link' : undefined}
                          tabIndex={isOpen && folder.documents?.[paperIndex] ? 0 : -1}
                          aria-label={folder.documents?.[paperIndex]?.title}
                          onClick={event => { event.stopPropagation(); const doc = folder.documents?.[paperIndex]; if (isOpen && doc) onDocumentClick?.(doc.to); }}
                          onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); const doc = folder.documents?.[paperIndex]; if (isOpen && doc) onDocumentClick?.(doc.to); } }}>
                          <span className="if-paper-glow" />
                          {paperIndex === 2 && <span className="if-paper-dot" />}
                          <span className="if-paper-mark">{title}</span>
                          {folder.documents?.[paperIndex] && <span className="if-paper-open-label">{folder.documents[paperIndex].description}<small>리포트 보기 ↗</small></span>}
                        </div>
                      ))}
                      <div className="if-front">
                        <div className="if-front-content">
                          <span className="if-folder-label">
                            <strong>{folder.name}</strong>
                            <small>{folder.detail}</small>
                          </span>
                          <span className="if-circle-action" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7">
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="if-folder-meta">
                  <span>{String(index + 1).padStart(2, '0')} / {folder.category}</span>
                  <span className="if-status">CLICK TO {isOpen ? 'CLOSE' : 'OPEN'}</span>
                </div>
              </article>
            );
          })}
        </section>
        <div className="if-footer"><span>HOVER TO TILT</span><span>·</span><span>CLICK TO OPEN</span><span>·</span><span>CLICK TO CLOSE</span></div>
      </div>
    </div>
  );
}
