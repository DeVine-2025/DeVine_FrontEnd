import { useId, useState } from 'react';
import { ResponsiveContainer, Sankey } from 'recharts';
import type { KeyImplementation } from '@apis/report/report';

type Props = { items: KeyImplementation[]; visible: boolean };
/** Every edge is an explicit capability listed by its implementation; no inferred scores. */
export default function ReportCapabilityMap({ items, visible }: Props) {
  const id = useId();
  const [selection, setSelection] = useState('all');
  const selected = selection === 'all' ? items : items.filter((_, i) => String(i) === selection);
  const implementations = selected.filter(item => item.capabilities?.some(text => text.trim()));
  const skills = [...new Set(implementations.flatMap(item => item.capabilities.filter(text => text.trim())))];
  if (!skills.length) return null;
  const nodes = [...implementations.map(item => ({ name: item.title, kind: 'implementation' })), ...skills.map(name => ({ name, kind: 'capability' }))];
  const links = implementations.flatMap((item, source) => [...new Set(item.capabilities)].filter(text => text.trim()).map(name => ({ source, target: implementations.length + skills.indexOf(name), value: 1 })));
  return <figure className="rw-capability-map" aria-labelledby={`${id}-title`}>
    <figcaption><div><h3 id={`${id}-title`}>어떤 구현에서 어떤 역량이 드러났을까요?</h3><p>리포트에 명시된 구현과 역량을 연결했습니다. 선은 연결 관계만 나타내며 중요도나 숙련도는 뜻하지 않습니다.</p></div><label htmlFor={`${id}-filter`}>구현 사례<select id={`${id}-filter`} value={selection} onChange={event => setSelection(event.target.value)}><option value="all">전체 구현 사례</option>{items.map((item, i) => <option key={i} value={String(i)}>{item.title}</option>)}</select></label></figcaption>
    <div className="rw-map-columns" aria-hidden="true"><span>구현 사례</span><span>연결된 역량</span></div>
    {visible && <div className="rw-map-scroll"><div className="rw-map-canvas" style={{ height: Math.max(220, skills.length * 38 + 24) }} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <Sankey data={{ nodes, links }} margin={{ top: 16, bottom: 16, left: 175, right: 205 }} nodeWidth={6} nodePadding={24} iterations={32} sort={false}
          node={({ x, y, width, height, payload, index }) => <g><title>{payload.name}</title><rect x={x} y={y} width={width} height={height} rx={3} fill={index < implementations.length ? 'var(--project-accent)' : 'var(--text-secondary)'} /><text x={index < implementations.length ? x - 12 : x + width + 12} y={y + height / 2} dy=".35em" textAnchor={index < implementations.length ? 'end' : 'start'} fill="var(--text-main)" fontSize={12}>{String(payload.name).length > 16 ? `${String(payload.name).slice(0, 15)}…` : payload.name}</text></g>}
          link={({ sourceX, sourceY, sourceControlX, targetControlX, targetX, targetY }) => <path d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`} fill="none" stroke="var(--project-accent)" strokeOpacity={.45} strokeWidth={2} />}
        />
      </ResponsiveContainer>
    </div></div>}
    <div className="rw-map-text"><p>연결 내용</p>{implementations.map((item, i) => <div key={i}><strong>{item.title}</strong><ul>{[...new Set(item.capabilities)].filter(text => text.trim()).map((text, n) => <li key={n}>{text}</li>)}</ul></div>)}</div>
  </figure>;
}
