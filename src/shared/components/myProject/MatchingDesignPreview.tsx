import { useState } from 'react';
import ProfileCard from '@components/common/ProfileCard';
import ProjectLg from '@components/common/ProjectLg';
import Tabs from '@components/tab/CommonTabs';
import ProfileDefault from '@assets/images/Profile_dark.svg?url';

type Decision = 'PENDING' | 'ACCEPT' | 'REJECT';
type Tab = 'suggested' | 'applied';
const examples = [
  { name: '김민준', project: '플로우업', role: 'Frontend Developer', stack: ['React', 'TypeScript'], decision: 'PENDING' },
  { name: '이서연', project: '그린로그', role: 'Backend Developer', stack: ['Java', 'Spring'], decision: 'ACCEPT' },
  { name: '박지훈', project: '필모먼트', role: 'Fullstack Developer', stack: ['Next.js', 'Node.js'], decision: 'REJECT' },
  { name: '정유진', project: '커넥트업', role: 'Frontend Developer', stack: ['React', 'Tailwind CSS'], decision: 'PENDING' },
] as const;

export default function MatchingDesignPreview({ role }: { role: 'pm' | 'developer' }) {
  const [tab, setTab] = useState<Tab>('suggested');
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const canRespond = role === 'pm' ? tab === 'applied' : tab === 'suggested';
  return <section>
    <Tabs<Tab> value={tab} onChange={setTab} items={[
      { value: 'suggested', label: role === 'pm' ? '제안한 개발자 · 4' : '받은 제안 · 4' },
      { value: 'applied', label: role === 'pm' ? '개발자 지원 현황 · 4' : '지원 중 · 4' },
    ]} />
    <div className="mt-6 flex flex-col gap-4">{examples.map((example, index) => {
      const key = `${tab}-${index}`;
      const decision = decisions[key] ?? example.decision;
      const action = canRespond && decision === 'PENDING' ? <div className="flex gap-3">
        <button type="button" className="cursor-pointer rounded-xl bg-[#6654F5] px-4 py-3 text-sm font-medium text-white" onClick={() => setDecisions(previous => ({ ...previous, [key]: 'ACCEPT' }))}>수락하기</button>
        <button type="button" className="cursor-pointer rounded-xl bg-surface-tab px-4 py-3 text-sm font-medium text-my-tab-text" onClick={() => setDecisions(previous => ({ ...previous, [key]: 'REJECT' }))}>거절하기</button>
      </div> : <span className={`rounded-xl px-4 py-3 text-sm font-medium ${decision === 'ACCEPT' ? 'bg-green-100 text-green-600' : decision === 'REJECT' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
        {decision === 'ACCEPT' ? '수락 완료' : decision === 'REJECT' ? '거절 완료' : '응답 대기 중'}
      </span>;
      return role === 'pm' ? <ProfileCard key={key} size="lg" nickname={example.name} role={example.role} roleTone="green" profileImageUrl={ProfileDefault} introduction="함께 고민하고 꾸준히 성장하는 개발자입니다." techStack={example.stack.map(name => ({ id: name, name }))} badges={[{ label: '소셜/커뮤니티', tone: 'blue' }]} header={<div><p className="text-sm text-badge-text-primary">프로젝트</p><h3 className="text-xl font-bold text-ui-900">{example.project}</h3><div className="my-4 h-px bg-[var(--ui-100)]" /></div>} action={action}/> : <ProjectLg key={key} title={example.project} categoryLabel={index % 2 === 0 ? '소셜/커뮤니티' : 'AI/데이터'} location="서울" mode="온라인" durationRangeName="3개월" showBookmark={false} showDue={false} roles={[]} action={action}/>;
    })}</div>
    <button type="button" className="mt-5 cursor-pointer text-sm text-ui-600 underline" onClick={() => setDecisions({})}>예시 상태 초기화</button>
  </section>;
}
