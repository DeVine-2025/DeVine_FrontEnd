export default function StatusBadge({ label, className, indicator: Indicator = 'span' }: { label: string; className: string; indicator?: 'span' | 'i' }) {
  return <span className={className}><Indicator aria-hidden="true" />{label}</span>;
}
