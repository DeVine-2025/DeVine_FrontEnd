import { useElasticUnderline } from '@hooks/useElasticUnderline';
import './view-toggle.css';

export type ViewMode = 'list' | 'grid';

type ViewToggleProps = { value: ViewMode; onChange: (value: ViewMode) => void; label?: string };

export default function ViewToggle({ value, onChange, label = '보기 방식' }: ViewToggleProps) {
  const { navRef, indicatorRef } = useElasticUnderline(value, 'button[aria-pressed="true"]');
  return <nav ref={navRef} className="shared-view-toggle" role="group" aria-label={label}>
    <span ref={indicatorRef} className="shared-view-indicator" aria-hidden="true" />
    <button type="button" aria-label="리스트 보기" title="리스트 보기" aria-pressed={value === 'list'} onClick={() => onChange('list')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01" strokeWidth="3"/></svg></button>
    <button type="button" aria-label="그리드 보기" title="그리드 보기" aria-pressed={value === 'grid'} onClick={() => onChange('grid')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg></button>
  </nav>;
}
