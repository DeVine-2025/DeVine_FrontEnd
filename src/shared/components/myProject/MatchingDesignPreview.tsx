import { useState } from 'react';
import { featuredProjects, recentProjects } from '@pages/home/home-mock-data';
import MatchingInbox, { type MatchingRow } from './MatchingCards';

import { matchingSamples } from './matching-samples';

export default function MatchingDesignPreview({ role }: { role: 'pm' | 'developer' }) {
  const [decisions, setDecisions] = useState<Record<number, string>>({});
  const rows = matchingSamples.map((example, index): MatchingRow => {
    const project = role === 'developer'
      ? [...featuredProjects, ...recentProjects].find((item) => item.title === example.project)
      : undefined;
    const href = role === 'pm'
      ? '/developer-detail/' + encodeURIComponent(example.name) + '?preview=sample'
      : project && '/project/sample-' + project.id;
    return {
      id: index,
      incoming: example.incoming,
      title: role === 'pm' ? example.name : example.project,
      projectName: role === 'pm' ? example.project : undefined,
      subtitle: example.part,
      image: project?.thumbnail,
      href,
      createdAt: '2026-11-0' + (5 - index),
      decision: decisions[index] ?? example.decision,
      message: role === 'pm'
        ? (example.incoming ? '프로젝트의 방향이 인상 깊어 지원했어요. 함께 좋은 서비스를 만들어가고 싶습니다.' : '프로젝트에 함께해 주시면 좋을 것 같아 협업을 제안드려요.')
        : (example.incoming ? '프로젝트에 함께해 주시면 좋을 것 같아 협업을 제안드려요.' : '프로젝트의 방향이 인상 깊어 지원했어요. 함께 좋은 서비스를 만들어가고 싶습니다.'),
      messageIsSample: true,
    };
  });

  return <>
    <MatchingInbox role={role} rows={rows} onRespond={async (id, decision) => setDecisions((previous) => ({ ...previous, [id]: decision }))} />
    {Object.keys(decisions).length > 0 && <button type="button" className="mt-4 text-[12px] text-[var(--text-secondary)] underline" onClick={() => setDecisions({})}>예시 상태 초기화</button>}
  </>;
}
