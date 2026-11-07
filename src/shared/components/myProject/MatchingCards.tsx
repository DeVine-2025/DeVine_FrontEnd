import defaultProjectImage from '@assets/images/devine-symbol.png';
import defaultProfileImage from '@assets/images/Profile_dark.svg';
import type { RespondDecision } from '@apis/matching';
import { ArrowDownLeft, ArrowUpRight, Check, ChevronDown, Clock3, Inbox } from 'lucide-react';
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
  const [filter, setFilter] = useState<Filter>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [pendingIds, setPendingIds] = useState<number[]>([]);
  const [failedIds, setFailedIds] = useState<number[]>([]);
  const [notice, setNotice] = useState('');
  const noticeRef = useRef<HTMLParagraphElement>(null);
  const copy = directions[role];

  const grouped: Record<Group, MatchingRow[]> = { needsReply: [], waiting: [], result: [], unknown: [] };
  const uniqueRows = [...new Map(rows.map((item) => [item.id, item])).values()]
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  for (const item of uniqueRows) grouped[getGroup(item)].push(item);
  const actionCount = grouped.needsReply.length;
  const currentGroups = groups.filter(({ value }) => filter === value ||
    (filter === 'all' && (grouped[value].length > 0 || (value === 'needsReply' && uniqueRows.length > 0 && !onLoadMore && !loadError))));

  function changeFilter(next: Filter) {
    setExpandedId(null);
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
      setExpandedId((current) => current === id ? null : current);
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
    if (group === 'needsReply') return '내 응답 필요';
    if (group === 'waiting') return copy.waiting;
    if (group === 'unknown') return '상태 확인 필요';
    return `${item.incoming ? '내가' : copy.otherSubject + (role === 'pm' ? '가' : '이')} ${item.decision === 'ACCEPT' ? '수락' : '거절'}`;
  }

  return (
    <section aria-label="지원 및 제안 목록" className="matching-inbox min-w-0">
      <div className="matching-filter-bar" role="group" aria-label="지원 상태 필터">
        {filters.map(({ value, label }) => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => changeFilter(value)}
            className={'matching-filter ' + focus}>
            {label}
            {value === 'needsReply' && actionCount > 0 && (
              <span className="matching-filter-count tabular-nums">{actionCount}{onLoadMore || loadError ? '+' : ''}</span>
            )}
          </button>
        ))}
      </div>

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
      ) : currentGroups.length > 0 ? (
        <div className="matching-groups">
          {currentGroups.map(({ value, label, empty }) => (
            <section key={value} aria-label={label} className="matching-group">
              <div className="matching-group-heading">
                <h2 className="text-[14px] font-semibold text-[var(--text-main)]">{label}</h2>
                <span className={`text-[12px] font-medium tabular-nums ${value === 'needsReply' && actionCount ? 'text-[var(--project-accent)]' : 'text-[var(--text-secondary)]'}`}>
                  {grouped[value].length}{onLoadMore || loadError ? '+' : ''}건
                </span>
              </div>
              {grouped[value].length === 0 ? (
                <p className="px-[16px] py-[18px] text-[13px] text-[var(--text-secondary)] sm:px-[20px]">
                  {onLoadMore || loadError ? '불러온 내역에는 해당 항목이 없어요.' : empty}
                </p>
              ) : (
                <ul className="matching-rows">
                  {grouped[value].map((item) => {
                    const expanded = expandedId === item.id;
                    const pending = pendingIds.includes(item.id);
                    const needsReply = value === 'needsReply';
                    const DirectionIcon = item.incoming ? ArrowDownLeft : ArrowUpRight;
                    const status = statusText(item, value);
                    const direction = item.incoming ? copy.incoming : copy.outgoing;
                    const meta = [item.projectName, item.subtitle].filter(Boolean).join(' / ');
                    return (
                      <li key={item.id} className="matching-row" data-expanded={expanded} data-needs-reply={needsReply}>
                        <div className="matching-row-content grid min-h-[66px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[12px] px-[16px] py-[10px] sm:px-[20px] md:grid-cols-[minmax(0,1fr)_118px_142px_82px_108px]">
                          <div className="flex min-w-0 items-center gap-[12px]">
                            <img alt="" src={item.image || (role === 'pm' ? defaultProfileImage : defaultProjectImage)}
                              className={`size-[36px] shrink-0 bg-[var(--surface-badge)] ${role === 'pm' ? 'rounded-full object-cover' : 'rounded-lg object-contain'}`} />
                            <div className="min-w-0">
                              <h3 className="text-[15px] font-semibold leading-snug text-[var(--text-main)] [overflow-wrap:anywhere]">{item.title}</h3>
                              {meta && <p className="mt-1 text-[13px] text-[var(--text-secondary)] [overflow-wrap:anywhere]">{meta}</p>}
                            </div>
                          </div>
                          <span className="hidden items-center gap-[6px] text-[13px] text-[var(--text-secondary)] md:inline-flex">
                            <DirectionIcon size={15} aria-hidden="true" />{direction}
                          </span>
                          <div className="col-start-1 row-start-2 mt-[8px] flex flex-wrap items-center gap-x-[8px] gap-y-[4px] text-[12px] text-[var(--text-secondary)] md:col-auto md:row-auto md:mt-0">
                            <span className="md:hidden">{direction}</span>
                            {!needsReply && (
                              <span data-status={value === 'waiting' ? 'waiting' : item.decision === 'ACCEPT' ? 'accepted' : item.decision === 'REJECT' ? 'rejected' : 'unknown'} className={`matching-status inline-flex items-center gap-[5px] font-medium ${item.decision === 'ACCEPT' ? 'text-[var(--positive-text)]' : 'text-[var(--text-secondary)]'}`}>
                                {value === 'waiting' && <Clock3 size={13} aria-hidden="true" />}{status}
                              </span>
                            )}
                            <span className="md:hidden"><MatchingDate value={item.createdAt} /></span>
                          </div>
                          <span className="hidden text-[12px] text-[var(--text-secondary)] md:block"><MatchingDate value={item.createdAt} /></span>
                          {needsReply ? (
                            <button type="button" aria-expanded={expanded} aria-controls={expanded ? `matching-row-${item.id}` : undefined}
                              onClick={() => setExpandedId(expanded ? null : item.id)}
                              aria-label={`${item.title} ${expanded ? '접기' : '검토'}`}
                              className={`matching-review col-start-2 row-start-1 row-span-2 justify-self-end md:col-auto md:row-auto ${buttonClass} border border-[var(--project-control-border)] text-[var(--text-main)] hover:bg-[var(--surface-badge)]`}>
                              {expanded ? '접기' : '검토'}
                              <ChevronDown size={14} aria-hidden="true" className={expanded ? 'rotate-180' : undefined} />
                            </button>
                          ) : item.href && (
                            <Link to={item.href} className={`col-start-2 row-start-1 row-span-2 justify-self-end whitespace-nowrap md:col-auto md:row-auto ${secondaryButton}`}>
                              {role === 'pm' ? '프로필 보기' : '프로젝트 보기'}
                              <ArrowUpRight size={14} aria-hidden="true" />
                            </Link>
                          )}
                        </div>
                        {expanded && (
                          <div id={`matching-row-${item.id}`} className="flex flex-wrap items-center justify-between gap-x-[20px] gap-y-[8px] border-t border-[var(--project-divider)] px-[16px] py-[12px] sm:px-[20px]">
                            <div className="min-w-0">
                              <p className="text-[14px] font-medium leading-relaxed text-[var(--text-main)]">
                                {role === 'pm' ? '지원에 응답하기' : '협업 제안에 응답하기'}
                              </p>
                              {item.href && <Link className={buttonClass + ' -ml-[12px] text-[var(--project-accent)] hover:underline'} to={item.href}>
                                {role === 'pm' ? '개발자 프로필 보기' : '프로젝트 보기'}<ArrowUpRight size={14} aria-hidden="true" />
                              </Link>}
                              {failedIds.includes(item.id) && <p role="alert" className="mt-2 text-[13px] text-[var(--form-error)]">응답을 저장하지 못했어요. 다시 시도해 주세요.</p>}
                            </div>
                            {needsReply && (
                              <div className="ml-auto flex flex-wrap items-center gap-[8px]">
                                {pending && <span role="status" className="text-[12px] text-[var(--text-secondary)]">저장 중…</span>}
                                <button type="button" disabled={pending} onClick={() => void respond(item.id, 'REJECT')}
                                  className={secondaryButton + ' border border-[var(--project-control-border)]'}>{copy.incomingNoun} 거절</button>
                                <button type="button" disabled={pending} onClick={() => void respond(item.id, 'ACCEPT')}
                                  className={buttonClass + ' bg-primary text-white hover:brightness-110'}>{copy.incomingNoun} 수락</button>
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      ) : !loadError && (
        <div className="flex items-center gap-[12px] rounded-xl border border-[var(--project-divider)] px-[16px] py-[24px] text-[14px] text-[var(--text-secondary)]">
          <Inbox size={20} className="shrink-0" aria-hidden="true" />
          <p>{onLoadMore ? '불러온 내역에는 해당 항목이 없어요.' : '아직 지원이나 제안 내역이 없어요.'}</p>
        </div>
      )}
      {onLoadMore && <button type="button" onClick={onLoadMore} disabled={loadingMore}
        className={secondaryButton + ' mt-[12px] border border-[var(--project-divider)]'}>{loadingMore ? '불러오는 중…' : '내역 더 보기'}</button>}
    </section>
  );
}

