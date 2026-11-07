import { useState } from 'react';
import { featuredProjects } from '@pages/home/home-mock-data';
import MatchingInbox, { type MatchingRow } from './MatchingCards';

const examples = [
  { name: '김민준', project: '플로우업', part: '프론트엔드', decision: 'PENDING', incoming: true },
  { name: '이서연', project: '그린로그', part: '백엔드', decision: 'PENDING', incoming: false },
  { name: '박지훈', project: '필모먼트', part: '프론트엔드', decision: 'ACCEPT', incoming: false },
  { name: '정유진', project: '커넥트업', part: '프론트엔드', decision: 'PENDING', incoming: true },
  { name: '김하늘', project: '링크노트', part: '인프라', decision: 'REJECT', incoming: true },
] as const;

export default function MatchingDesignPreview({ role }: { role: 'pm' | 'developer' }) {
  const [decisions, setDecisions] = useState<Record<number, string>>({});
  const rows = examples.map((example, index): MatchingRow => ({
    id: index,
    incoming: example.incoming,
    title: role === 'pm' ? example.name : example.project,
    projectName: role === 'pm' ? example.project : undefined,
    subtitle: example.part,
    image: role === 'developer' ? featuredProjects.find((project) => project.title === example.project)?.thumbnail : undefined,
    createdAt: '2026-11-0' + (5 - index),
    decision: decisions[index] ?? example.decision,
  }));

  return <>
    <MatchingInbox role={role} rows={rows} onRespond={async (id, decision) => setDecisions((previous) => ({ ...previous, [id]: decision }))} />
    {Object.keys(decisions).length > 0 && <button type="button" className="mt-4 text-[12px] text-[var(--text-secondary)] underline" onClick={() => setDecisions({})}>예시 상태 초기화</button>}
  </>;
}
