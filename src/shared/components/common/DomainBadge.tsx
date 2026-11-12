import type { Domain } from '@constants/domain';

const icons: Record<Domain, React.ReactNode> = {
  교육: <><path d="M3 4.5h5.5A3.5 3.5 0 0 1 12 8v11a3 3 0 0 0-3-3H3z" /><path d="M21 4.5h-5.5A3.5 3.5 0 0 0 12 8v11a3 3 0 0 1 3-3h6z" /></>,
  헬스케어: <path d="M12 20s-7.5-4.4-9-9C1.8 6.8 6.5 3.4 10 6.3L12 8l2-1.7c3.5-2.9 8.2.5 7 4.7-1.5 4.6-9 9-9 9Z" />,
  '소셜/커뮤니티': <><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-1a5.5 5.5 0 0 1 11 0v1M16 5.4a3 3 0 0 1 0 5.8M17 13.2a5 5 0 0 1 3.5 4.8v1" /></>,
  핀테크: <><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 8V6a2 2 0 0 1 2-2h12M16 12h5v4h-5a2 2 0 0 1 0-4Z" /></>,
  엔터테인먼트: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="m10 8 6 4-6 4z" /></>,
  이커머스: <><path d="M5 8h14l1 12H4L5 8ZM9 8V6a3 3 0 0 1 6 0v2" /></>,
  'AI/데이터': <><circle cx="12" cy="5" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="18" r="2" /><path d="m11 7-5 9M13 7l5 9M7 18h10" /></>,
  기타: <><circle cx="7" cy="7" r="1.5" /><circle cx="17" cy="7" r="1.5" /><circle cx="7" cy="17" r="1.5" /><circle cx="17" cy="17" r="1.5" /></>,
};

export default function DomainBadge({ domain, className }: { domain: Domain; className: string }) {
  return <span className={className}><svg className="block size-[13px] flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[domain]}</svg><span className="block leading-[inherit]">{domain}</span></span>;
}
