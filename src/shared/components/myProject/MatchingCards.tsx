import type { RespondDecision } from '@apis/matching';
import { CalendarDays, Check, ChevronDown, FolderOpen, Inbox, MessageSquare, Send, UserRound } from 'lucide-react';
import { useElasticUnderline } from '@hooks/useElasticUnderline';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './matching-inbox.css';

type Group = 'needsReply' | 'waiting' | 'result' | 'unknown';
type Filter = Exclude<Group, 'unknown'> | 'all';
type Role = 'pm' | 'developer';

export type MatchingRow = {
  id: number;
  incoming: boolean;
  title: string;
  projectName?: string;
  subtitle?: string;
  image?: string | null;
  href?: string;
  createdAt?: string;
  decision?: string;
  message?: string;
  messageIsSample?: boolean;
};

const groups = [
  { value: 'needsReply', label: '내 응답 필요', empty: '지금 응답할 항목이 없어요.' },
  { value: 'waiting', label: '상대 답변 대기', empty: '상대방의 답변을 기다리는 항목이 없어요.' },
  { value: 'result', label: '처리 결과', empty: '아직 처리된 항목이 없어요.' },
  { value: 'unknown', label: '상태 확인 필요', empty: '' },
] as const;

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'needsReply', label: '응답 필요' },
  { value: 'waiting', label: '답변 대기' },
  { value: 'result', label: '결과' },
];

const directions = {
  pm: { incoming: '받은 지원', outgoing: '보낸 제안', waiting: '개발자 답변 대기', incomingNoun: '지원', otherSubject: '개발자' },
  developer: { incoming: '받은 제안', outgoing: '보낸 지원', waiting: 'PM 답변 대기', incomingNoun: '제안', otherSubject: 'PM' },
};

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--project-accent)]';
const buttonClass = 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md px-[12px] text-[13px] font-semibold transition-colors motion-reduce:transition-none disabled:opacity-50 ' + focus;
const secondaryButton = buttonClass + ' text-[var(--text-secondary)] hover:bg-[var(--surface-badge)] hover:text-[var(--text-main)]';

function getGroup(item: MatchingRow): Group {
  if (item.decision === 'PENDING') return item.incoming ? 'needsReply' : 'waiting';
  if (item.decision === 'ACCEPT' || item.decision === 'REJECT') return 'result';
  return 'unknown';
}

const dateFormatter = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' });

function MatchingDate({ value }: { value?: string }) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return null;
  return <time className="tabular-nums" dateTime={value}>{dateFormatter.format(date)}</time>;
}

type Props = {
  role: Role;
  rows: MatchingRow[];
  onRespond: (id: number, decision: RespondDecision) => Promise<void>;
  loading?: boolean;
  loadError?: boolean;
  loadingMore?: boolean;
  onRetry?: () => void;
  onLoadMore?: () => void;
};

export default function MatchingInbox({
  role, rows, onRespond, loading, loadError, loadingMore, onRetry, onLoadMore,
}: Props) {
  const [sort, setSort] = useState<'latest' | 'oldest'>('latest');
  const [filter, setFilter] = useState<Filter>('all');
  const { navRef, indicatorRef } = useElasticUnderline(filter, 'button[aria-pressed="true"]');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pendingIds, setPendingIds] = useState<number[]>([]);
  const [failedIds, setFailedIds] = useState<number[]>([]);
  const [notice, setNotice] = useState('');
  const noticeRef = useRef<HTMLParagraphElement>(null);
  const copy = directions[role];

  const grouped: Record<Group, MatchingRow[]> = { needsReply: [], waiting: [], result: [], unknown: [] };
  const uniqueRows = [...new Map(rows.map((item) => [item.id, item])).values()]
    .sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return Number(Boolean(b.createdAt)) - Number(Boolean(a.createdAt));
      return (sort === 'latest' ? -1 : 1) * a.createdAt.localeCompare(b.createdAt);
    });
  for (const item of uniqueRows) grouped[getGroup(item)].push(item);
  const counts = { waiting: grouped.waiting.length, result: grouped.result.length };
  const partial = onLoadMore || loadError ? '+' : '';
  const currentGroups = groups.filter(({ value }) => filter === value ||
    (filter === 'all' && (grouped[value].length > 0 || (value === 'needsReply' && uniqueRows.length > 0 && !onLoadMore && !loadError))));

  const visibleRows = currentGroups.flatMap(({ value }) => grouped[value]);
  const selectedRow = visibleRows.find(({ id }) => id === selectedId) ?? visibleRows[0];

  function changeFilter(next: Filter) {
    setSelectedId(null);
    setFilter(next);
  }

  async function respond(id: number, decision: RespondDecision) {
    setPendingIds((current) => [...current, id]);
    setFailedIds((current) => current.filter((failedId) => failedId !== id));
    setNotice('');
    try {
      await onRespond(id, decision);
      const title = uniqueRows.find((item) => item.id === id)?.title;
      const verb = decision === 'ACCEPT' ? '수락' : '거절';
      const subject = title ? (role === 'pm' ? `${title}님의 ` : `${title} 프로젝트의 `) : '';
      setNotice(`${subject}${copy.incomingNoun}을 ${verb}했어요.`);
      requestAnimationFrame(() => {
        if (document.activeElement === document.body) noticeRef.current?.focus();
      });
    } catch {
      setFailedIds((current) => [...current, id]);
    } finally {
      setPendingIds((current) => current.filter((pendingId) => pendingId !== id));
    }
  }

  function statusText(item: MatchingRow, group: Group) {
    if (group === 'needsReply') return '응답 필요';
    if (group === 'waiting') return copy.waiting;
    if (group === 'unknown') return '상태 확인 필요';
    return `${item.incoming ? '내가' : copy.otherSubject + (role === 'pm' ? '가' : '이')} ${item.decision === 'ACCEPT' ? '수락' : '거절'}`;
  }

  function renderDetail(item: MatchingRow) {
    const group = getGroup(item);
    const pending = pendingIds.includes(item.id);
    const DetailIcon = role === 'pm' ? UserRound : FolderOpen;
    const detailLabel = role === 'pm' ? '개발자 프로필 보기' : '프로젝트 상세 보기';
    const isProposal = role === 'developer' ? item.incoming : !item.incoming;
    return <article key={item.id} className="matching-detail" aria-label={item.title + ' 상세 정보'}>
      <div className="matching-detail-header">
        {role === 'pm' && <span className="matching-avatar matching-avatar--detail" aria-hidden="true">{item.image ? <img src={item.image} alt="" /> : Array.from(item.title.trim())[0]}</span>}
        <div className="matching-detail-person">
          <h2>
            {item.href ? (
              <Link to={item.href} className={'matching-title-link ' + focus} title={detailLabel}>
                {item.title}<DetailIcon size={17} aria-hidden="true" />
              </Link>
            ) : item.title}
          </h2>
          <p>{[item.projectName, item.subtitle].filter(Boolean).join(' · ')}</p>
        </div>
        <span className="matching-status" data-status={group === 'needsReply' ? 'action' : group === 'waiting' ? 'waiting' : item.decision === 'ACCEPT' ? 'accepted' : 'rejected'}>{statusText(item, group)}</span>
      </div>
      <div className="matching-detail-section"><h3>지원 정보</h3>
        {item.createdAt && <div className="matching-detail-info"><span><CalendarDays size={18} aria-hidden="true" /> 지원일</span><strong><MatchingDate value={item.createdAt} /></strong></div>}
        <div className="matching-detail-info"><span>{item.incoming ? <Inbox size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />} 지원 유형</span><strong>{item.incoming ? copy.incoming : copy.outgoing}</strong></div>
        {role === 'pm' && item.subtitle && <div className="matching-detail-info"><span><UserRound size={18} aria-hidden="true" /> 지원 포지션</span><strong>{item.subtitle}</strong></div>}
      </div>
      <div className="matching-detail-section matching-message">
        <div className="matching-message-heading">
          <h3><MessageSquare size={17} aria-hidden="true" />{isProposal ? '제안 메시지' : '지원 메시지'}</h3>
        </div>
        <div className="matching-message-body">
          {item.message ? <><p className="matching-message-text">{item.message}</p>{item.messageIsSample && <span className="matching-message-sample">예시 메시지</span>}</> : <p className="matching-message-empty">확인할 수 있는 메시지가 없어요.</p>}
        </div>
      </div>
      {failedIds.includes(item.id) && <p role="alert" className="matching-detail-error">응답을 저장하지 못했어요. 다시 시도해 주세요.</p>}
      {group === 'needsReply' && <div className="matching-detail-actions">
        {pending && <span role="status">저장 중…</span>}
        <button type="button" disabled={pending} onClick={() => void respond(item.id, 'REJECT')} className={buttonClass + ' matching-reject'}>거절</button>
        <button type="button" disabled={pending} onClick={() => void respond(item.id, 'ACCEPT')} className={buttonClass + ' matching-accept'}>{copy.incomingNoun} 수락</button>
      </div>}
    </article>;
  }

  return (
    <section aria-label="지원 및 제안 목록" className="matching-inbox min-w-0">
      <nav ref={navRef} className="matching-filter-bar" aria-label="지원 상태 필터">
        <span ref={indicatorRef} className="matching-filter-indicator" aria-hidden="true" />
        {filters.map(({ value, label }) => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => changeFilter(value)}
            className={'matching-filter ' + focus}>
            {label}
            {!loading && (value === 'waiting' || value === 'result') && <span className="matching-filter-count tabular-nums">{counts[value]}{partial}</span>}
          </button>
        ))}
      </nav>

      <div aria-live="polite">
        {notice && (
          <div className="mb-[12px] flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--project-divider)] bg-[var(--surface-filter)] px-[16px] text-[13px] text-[var(--text-main)]">
            <p ref={noticeRef} tabIndex={-1} className={'flex min-w-0 items-center gap-2 py-[10px] ' + focus}>
              <Check size={16} className="shrink-0 text-[var(--positive-text)]" aria-hidden="true" />{notice}
            </p>
            {filter !== 'result' && <button type="button" className={buttonClass + ' text-[var(--project-accent)]'} onClick={() => changeFilter('result')}>결과 보기</button>}
          </div>
        )}
      </div>

      {loadError && (
        <p role="alert" className="mb-[12px] rounded-lg border border-[var(--project-divider)] px-[16px] text-[13px] text-[var(--text-secondary)]">
          일부 내역을 불러오지 못했어요. <button type="button" onClick={onRetry} className={buttonClass + ' text-[var(--project-accent)]'}>다시 시도</button>
        </p>
      )}

      {loading ? (
        <div role="status" className="rounded-xl border border-[var(--project-divider)]">
          <span className="sr-only">내역을 불러오고 있어요.</span>
          {[0, 1, 2].map((index) => (
            <div key={index} aria-hidden="true" className="flex min-h-[70px] items-center gap-[14px] border-b border-[var(--project-divider)] px-[18px] last:border-b-0">
              <div className="size-[36px] shrink-0 rounded-lg bg-[var(--surface-badge)]" />
              <div className="grid gap-2">
                <div className="h-[12px] w-[105px] rounded bg-[var(--surface-badge)]" />
                <div className="h-[10px] w-[74px] rounded bg-[var(--surface-filter)]" />
              </div>
            </div>
          ))}
        </div>
      ) : visibleRows.length > 0 ? (
        <div className="matching-workspace">
          <div className="matching-list-panel">
            <div className="matching-list-heading">
              <h2>지원 목록 <span>{visibleRows.length}{partial}</span></h2>
              <label className="matching-sort">
                <select aria-label="지원 목록 정렬" value={sort} onChange={(event) => setSort(event.target.value === 'oldest' ? 'oldest' : 'latest')}>
                  <option value="latest">최신순</option><option value="oldest">오래된순</option>
                </select><ChevronDown size={15} aria-hidden="true" />
              </label>
            </div>
            {currentGroups.map(({ value, label }) => grouped[value].length > 0 && <section key={value} aria-label={label}>
              <h3 className="matching-list-group">{label} <span>{grouped[value].length}{partial}</span></h3><ul className="matching-rows">
                {grouped[value].map((item) => {
                  const selected = item.id === selectedRow?.id;
                  return <li key={item.id}>
                    <button type="button" className={'matching-list-item ' + focus} aria-pressed={selected} onClick={() => setSelectedId(item.id)}>
                      {role === 'pm' && <span className="matching-avatar matching-avatar--list" aria-hidden="true">{item.image ? <img src={item.image} alt="" /> : Array.from(item.title.trim())[0]}</span>}
                      <span className="matching-list-copy"><strong>{item.title}</strong><small>{[item.projectName, item.subtitle].filter(Boolean).join(' · ')}</small></span>
                      <span className="matching-status" data-status={value === 'needsReply' ? 'action' : value === 'waiting' ? 'waiting' : item.decision === 'ACCEPT' ? 'accepted' : 'rejected'}>{value === 'needsReply' ? '응답 필요' : value === 'waiting' ? '답변 대기' : statusText(item, value)}</span>
                    </button>
                    {selected && <div className="matching-detail-mobile">{renderDetail(item)}</div>}
                  </li>;
                })}
              </ul></section>)}
          </div>
          <div className="matching-detail-desktop">{selectedRow && renderDetail(selectedRow)}</div>
        </div>
      ) : !loadError && (
        <div className="flex items-center gap-[12px] rounded-xl border border-[var(--project-divider)] px-[16px] py-[24px] text-[14px] text-[var(--text-secondary)]">
          <Inbox size={20} className="shrink-0" aria-hidden="true" />
          <p>{onLoadMore ? '불러온 내역에는 해당 항목이 없어요.' : filter === 'all' ? '아직 지원이나 제안 내역이 없어요.' : currentGroups[0]?.empty}</p>
        </div>
      )}
      {onLoadMore && <button type="button" onClick={onLoadMore} disabled={loadingMore}
        className={secondaryButton + ' mt-[12px] border border-[var(--project-divider)]'}>{loadingMore ? '불러오는 중…' : '내역 더 보기'}</button>}
    </section>
  );
}

