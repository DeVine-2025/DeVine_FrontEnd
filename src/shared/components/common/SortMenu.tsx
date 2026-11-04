import { useEffect, useId, useRef, useState } from 'react';
import ChevronIcon from '@assets/icons/chevron-down.svg?react';
import './sort-menu.css';

type SortOption = { value: string; label: string };
type SortMenuProps = { value: string; onChange: (value: string) => void; options: readonly SortOption[]; label?: string };

export default function SortMenu({ value, onChange, options, label = '정렬' }: SortMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const selectedLabel = options.find(option => option.value === value)?.label ?? '';

  useEffect(() => {
    if (!open) return;
    const onOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener('pointerdown', onOutsideClick);
    document.addEventListener('keydown', onEscape);
    return () => { document.removeEventListener('pointerdown', onOutsideClick); document.removeEventListener('keydown', onEscape); };
  }, [open]);

  return <div ref={containerRef} className="shared-sort">
    <button ref={triggerRef} type="button" className="shared-sort-trigger" aria-label={`${label}: ${selectedLabel}`} aria-expanded={open} aria-controls={menuId} onClick={() => setOpen(current => !current)}>
      {selectedLabel}<ChevronIcon aria-hidden="true" />
    </button>
    {open && <div id={menuId} className="shared-sort-menu" role="group" aria-label={`${label} 방식`}>
      {options.map(option => <button type="button" key={option.value} aria-pressed={option.value === value} onClick={() => { onChange(option.value); setOpen(false); triggerRef.current?.focus(); }}>{option.label}{option.value === value && <span aria-hidden="true">✓</span>}</button>)}
    </div>}
  </div>;
}
