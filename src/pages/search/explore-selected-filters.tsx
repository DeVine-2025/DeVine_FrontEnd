import { X } from 'lucide-react';
import './explore-selected-filters.css';

type SelectedFilter = { id: string; label: string; group: string; onRemove: () => void };

export default function ExploreSelectedFilters({ items, onClear }: { items: SelectedFilter[]; onClear: () => void }) {
  if (!items.length) return null;
  return <div className="explore-selected-filters" role="group" aria-label="적용된 필터">
    <span className="explore-selected-label">선택한 조건</span>
    {items.map(item => <button key={item.id} className="explore-selected-chip" type="button" aria-label={`${item.group}: ${item.label} 조건 해제`} onClick={item.onRemove}><span>{item.label}</span><X size={12} aria-hidden="true" /></button>)}
    <button className="explore-selected-clear" type="button" onClick={onClear}>조건 초기화</button>
  </div>;
}
