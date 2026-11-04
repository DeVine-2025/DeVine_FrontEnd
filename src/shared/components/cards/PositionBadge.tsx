import './position-badge.css';

const POSITION_LABELS: Record<string, string> = {
  'Frontend Developer': '프론트엔드',
  'Backend Developer': '백엔드',
  FRONTEND: '프론트엔드',
  BACKEND: '백엔드',
  INFRA: '인프라',
  '인프라': '인프라',
  '프론트엔드': '프론트엔드',
  '백엔드': '백엔드',
};

export default function PositionBadge({ position }: { position: string }) {
  const label = POSITION_LABELS[position];
  return label ? <span className="position-badge">{label}</span> : null;
}
