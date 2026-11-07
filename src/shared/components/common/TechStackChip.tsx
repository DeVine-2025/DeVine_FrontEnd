import { formatTechstackLabel } from '@apis/techstacks';
import { ExploreTechIcon, getTechDisplayName } from '@components/cards/TechStackBadges';
import { Layers, X } from 'lucide-react';
import './tech-stack-chip.css';

type TechStackChipProps = { name: string; onRemove: () => void; disabled?: boolean };

export default function TechStackChip({ name, onRemove, disabled = false }: TechStackChipProps) {
  const label = getTechDisplayName(formatTechstackLabel(name));
  return <li className="tech-stack-chip">
    <span className="tech-stack-chip-icon" aria-hidden="true"><ExploreTechIcon name={name} /><Layers size={13} /></span>
    <span>{label}</span>
    <button type="button" aria-label={`${label} 삭제`} disabled={disabled} onClick={onRemove}><X size={13} aria-hidden="true" /></button>
  </li>;
}
