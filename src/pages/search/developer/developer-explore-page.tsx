import ViewToggle from '@components/common/ViewToggle';
import { CardLoading } from '@components/common/LoadingLayouts';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@clerk/clerk-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getDevelopers } from '@apis/developer';
import { createBookmark, deleteBookmark, getBookmarks } from '@apis/bookmarks';
import ChevronIcon from '@assets/icons/chevron-down.svg?react';
import SearchIcon from '@assets/icons/search.svg?react';
import { DOMAIN_OPTIONS } from '@constants/domain';
import { FRONTEND_LANGUAGE_FRAMEWORK, FRONTEND_MOBILE, BACKEND_LANGUAGE, BACKEND_FRAMEWORK, BACKEND_DATABASE, INFRA_CLOUD, INFRA_CONTAINER } from '@constants/position-tech-stack';
import { normalizeTechstackKey, TECHSTACK_KEY_TO_NAME, PROJECT_TYPE_TO_FIELD } from '@mappers/projectFilters';
import { DOMAIN_LABEL_TO_CODE } from '@t/member';
import ExploreTabs from '../explore-tabs';
import ExploreSelectedFilters from '../explore-selected-filters';
import { getTechDisplayName } from '@components/cards/TechStackBadges';
import DeveloperCard from '@components/cards/DeveloperCard';
import '../explore-shared.css';
import './developer-explore-page.css';

const groups = [
  { label: '프론트엔드', stacks: [...FRONTEND_LANGUAGE_FRAMEWORK, ...FRONTEND_MOBILE] },
  { label: '백엔드', stacks: [...BACKEND_LANGUAGE, ...BACKEND_FRAMEWORK, ...BACKEND_DATABASE] },
  { label: '인프라', stacks: [...INFRA_CLOUD, ...INFRA_CONTAINER] },
];
const positions = [{ code: 'FRONTEND', label: '프론트엔드' }, { code: 'BACKEND', label: '백엔드' }, { code: 'INFRA', label: '인프라' }];

function FilterGroup({ title, children, initialOpen = false }: { title: string; children: ReactNode; initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  return <section className={`explore-filter-group ${open ? 'is-open' : ''}`}>
    <button type="button" className="explore-filter-heading" aria-expanded={open} onClick={() => setOpen(value => !value)}>{title}<ChevronIcon aria-hidden="true" /></button>
    <div className="explore-filter-panel" inert={!open}><div className="explore-filter-panel-inner">{children}</div></div>
  </section>;
}

export default function DeveloperExplorePage({ mode = 'search' }: { mode?: 'search' | 'recommend' }) {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [techs, setTechs] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [techQuery, setTechQuery] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('grid');
  const [bookmarks, setBookmarks] = useState<Record<string, number>>({});
  const [pending, setPending] = useState<Set<string>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const previousPositions = useRef<Map<string, DOMRect> | null>(null);
  const changeView = (next: 'list' | 'grid') => {
    if (next === view) return;
    const positions = new Map<string, DOMRect>();
    listRef.current?.querySelectorAll<HTMLElement>('.developer-explore-card').forEach(card => {
      if (card.dataset.nickname) positions.set(card.dataset.nickname, card.getBoundingClientRect());
      card.getAnimations().forEach(animation => animation.cancel());
    });
    previousPositions.current = positions;
    setView(next);
  };
  useLayoutEffect(() => {
    const positions = previousPositions.current;
    previousPositions.current = null;
    if (!positions || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    listRef.current?.querySelectorAll<HTMLElement>('.developer-explore-card').forEach((card, index) => {
      const before = card.dataset.nickname && positions.get(card.dataset.nickname);
      if (!before) return;
      const after = card.getBoundingClientRect();
      const dx = before.left - after.left;
      const dy = before.top - after.top;
      card.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(.985)`, opacity: .78 },
        { transform: `translate(${dx * .08}px, ${dy * .08}px) scale(1.006)`, opacity: 1, offset: .78 },
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      ], { duration: 460, delay: Math.min(index, 7) * 22, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' });
    });
  }, [view]);
  const techNames = useMemo(() => techs.map(key => TECHSTACK_KEY_TO_NAME[normalizeTechstackKey(key)]).filter((value): value is string => Boolean(value)), [techs]);
  const categories = useMemo(() => domains.map(domain => DOMAIN_LABEL_TO_CODE[domain as keyof typeof DOMAIN_LABEL_TO_CODE]), [domains]);
  const query = useInfiniteQuery({
    queryKey: ['explore-developers', categories, techNames],
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => getDevelopers({ page: pageParam, size: 10, categories, techNames }, await getToken(), signal),
    getNextPageParam: page => page.last || page.page >= page.totalPages ? undefined : page.page + 1,
  });
  const searchTerm = search.trim().toLowerCase();
  const developers = query.data?.pages.flatMap(page => page.content).filter(item => item.member?.mainType !== 'PM' && (!selectedPositions.length || (item.techstacks ?? []).some(stack => stack.genre == null && selectedPositions.includes(stack.name))) && (!searchTerm || [item.member.nickname, item.member.body ?? '', ...(item.techstacks ?? []).map(stack => stack.name)].some(value => value.toLowerCase().includes(searchTerm)))) ?? [];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if ((searchTerm || selectedPositions.length > 0) && query.hasNextPage && !query.isFetching && !query.isFetchNextPageError) void query.fetchNextPage();
  }, [searchTerm, selectedPositions.length, query.hasNextPage, query.isFetching, query.isFetchNextPageError, query.fetchNextPage]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const data = await getBookmarks(token);
        if (!active) return;
        const saved: Record<string, number> = {};
        data.forEach(item => { if (item.targetType === 'DEVELOPER' && item.targetNickname) saved[item.targetNickname] = item.bookmarkId; });
        setBookmarks(saved);
      } catch (error) { console.error('개발자 찜 목록을 불러오지 못했습니다.', error); }
    })();
    return () => { active = false; };
  }, [getToken]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || searchTerm || selectedPositions.length > 0 || !query.hasNextPage || query.isFetchingNextPage || query.isFetchNextPageError || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) void query.fetchNextPage(); }, { rootMargin: '0px 0px 200px' });
    observer.observe(target);
    return () => observer.disconnect();
  }, [searchTerm, selectedPositions.length, query.hasNextPage, query.isFetchingNextPage, query.isFetchNextPageError, query.fetchNextPage]);

  const toggle = (value: string, setter: typeof setTechs) => setter(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value]);
  const changeBookmark = async (nickname: string, selected: boolean) => {
    const token = await getToken();
    if (!token) { navigate('/login'); return; }
    setPending(current => new Set(current).add(nickname));
    try {
      if (selected) {
        const result = await createBookmark({ targetType: 'DEVELOPER', targetNickname: nickname }, token);
        setBookmarks(current => ({ ...current, [nickname]: result.bookmarkId }));
      } else if (bookmarks[nickname]) {
        await deleteBookmark(bookmarks[nickname], token);
        setBookmarks(current => { const next = { ...current }; delete next[nickname]; return next; });
      }
    } catch (error) { alert(error instanceof Error ? error.message : '찜 처리에 실패했습니다.'); }
    finally { setPending(current => { const next = new Set(current); next.delete(nickname); return next; }); }
  };

  return <div className="project-explore developer-explore desktop-content">
    <Helmet><title>개발자 {mode === 'recommend' ? '추천' : '탐색'} | Devine</title></Helmet>
    <aside className="explore-sidebar" aria-label="개발자 필터">
      <div className="explore-sidebar-title"><strong>필터</strong><button type="button" onClick={() => { setTechs([]); setDomains([]); setSelectedPositions([]); setTechQuery(''); }}>전체 초기화</button></div>
      <FilterGroup title="포지션" initialOpen>
        {positions.map(position => <label className={`explore-filter-option ${selectedPositions.includes(position.code) ? 'selected' : ''}`} key={position.code}><input type="checkbox" checked={selectedPositions.includes(position.code)} onChange={() => toggle(position.code, setSelectedPositions)} /><span>{position.label}</span></label>)}
      </FilterGroup>
      <FilterGroup title="기술 스택" initialOpen>
        <label className="explore-tech-search"><SearchIcon aria-hidden="true" /><input value={techQuery} onChange={event => setTechQuery(event.target.value)} placeholder="기술 스택 검색" aria-label="기술 스택 검색" /></label>
        {groups.map(group => {
          const visible = group.stacks.filter(stack => getTechDisplayName(stack.label).toLowerCase().includes(techQuery.trim().toLowerCase()) || normalizeTechstackKey(stack.label).includes(normalizeTechstackKey(techQuery)));
          return visible.length > 0 && <div className="pt-[8px] pb-[4px]" key={group.label}><strong className="block px-[12px] pb-[4px] text-[11px] font-semibold text-[var(--text-secondary)]">{group.label}</strong>{visible.map(stack => <label className={`explore-filter-option ${techs.includes(stack.key) ? 'selected' : ''}`} key={stack.key}><input type="checkbox" checked={techs.includes(stack.key)} onChange={() => toggle(stack.key, setTechs)} /><span>{getTechDisplayName(stack.label)}</span></label>)}</div>;
        })}
      </FilterGroup>
      <FilterGroup title="관심 도메인" initialOpen>
        {DOMAIN_OPTIONS.map(domain => <label className={`explore-filter-option ${domains.includes(domain) ? 'selected' : ''}`} key={domain}><input type="checkbox" checked={domains.includes(domain)} onChange={() => toggle(domain, setDomains)} /><span>{domain}</span></label>)}
      </FilterGroup>
      <FilterGroup title="프로젝트 유형">
        <fieldset disabled aria-describedby="developer-project-type-note" className="developer-project-types">
          <legend className="sr-only">프로젝트 유형 · 데이터 연동 준비 중</legend>
          {['전체', ...Object.keys(PROJECT_TYPE_TO_FIELD)].map(type => <label className="explore-filter-option is-unavailable" key={type}><input type="checkbox" checked={type === '전체'} readOnly /><span>{type}</span></label>)}
        </fieldset>
        <p id="developer-project-type-note" className="mx-[8px] mt-[8px] text-[10px] leading-[1.6] text-[var(--text-secondary)]">유형 데이터 연동 후 사용할 수 있어요.</p>
      </FilterGroup>
    </aside>
    <main className="explore-main">
      <div className="explore-title"><h1>{mode === 'recommend' ? '추천' : '탐색'}</h1><p>프로젝트와 함께할 팀원을 찾아보세요.</p></div>
      <ExploreTabs mode={mode} />
      <label className="explore-search"><SearchIcon aria-hidden="true" /><input ref={searchRef} value={search} onChange={event => setSearch(event.target.value)} placeholder="개발자 이름, 소개, 기술 스택을 검색해보세요." aria-label="개발자 검색" /><kbd>Ctrl / ⌘ K</kbd></label>
      <ExploreSelectedFilters items={[
        ...selectedPositions.map(value => ({ id: 'position:' + value, label: positions.find(position => position.code === value)?.label ?? value, group: '포지션', onRemove: () => toggle(value, setSelectedPositions) })),
        ...techs.map(value => ({ id: 'tech:' + value, label: getTechDisplayName(groups.flatMap(group => group.stacks).find(stack => stack.key === value)?.label ?? value), group: '기술 스택', onRemove: () => toggle(value, setTechs) })),
        ...domains.map(value => ({ id: 'domain:' + value, label: value, group: '관심 도메인', onRemove: () => toggle(value, setDomains) })),
      ]} onClear={() => { setTechs([]); setDomains([]); setSelectedPositions([]); }} />
      <div className="explore-toolbar developer-explore-toolbar">
        <span className="text-[12px] text-[var(--text-secondary)]" aria-live="polite">{(searchTerm || selectedPositions.length > 0) && query.isFetchNextPageError ? `불러온 목록의 검색 결과 ${developers.length}명` : (searchTerm || selectedPositions.length > 0) && query.hasNextPage ? '전체 개발자 목록에서 검색 중...' : searchTerm ? `검색 결과 ${developers.length}명` : techs.length || domains.length || selectedPositions.length ? '선택한 조건에 맞는 개발자' : ''}</span>
        <ViewToggle value={view} onChange={changeView} />
      </div>
      {query.isPending && <CardLoading kind="developer" view={view} />}
      <div ref={listRef} className={`developer-explore-list developer-explore-${view}`}>
        {query.isError && !query.data && <div className="developer-list-message" role="alert">개발자를 불러오지 못했어요. <button type="button" onClick={() => void query.refetch()}>다시 시도</button></div>}
        {!query.isPending && !query.isError && !query.hasNextPage && developers.length === 0 && <div className="explore-empty"><strong>조건에 맞는 개발자가 없어요.</strong><p>검색어나 필터를 바꿔 다시 찾아보세요.</p><button type="button" onClick={() => { setTechs([]); setDomains([]); setSelectedPositions([]); setSearch(''); }}>검색 및 필터 초기화</button></div>}
        {developers.map(developer => <DeveloperCard key={developer.member.nickname} developer={developer} bookmarked={bookmarks[developer.member.nickname] != null} pending={pending.has(developer.member.nickname)} variant={view} showTechStacks={false} onBookmarkChange={next => changeBookmark(developer.member.nickname, next)} />)}
      </div>
      {query.hasNextPage && <div ref={loadMoreRef} className="explore-load-more"><button type="button" disabled={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>{query.isFetchingNextPage ? '불러오는 중...' : '개발자 더 보기'}</button></div>}
      {query.isFetchNextPageError && <p className="developer-list-message" role="alert">추가 결과를 불러오지 못했어요. 더 보기로 다시 시도해 주세요.</p>}
    </main>
  </div>;
}
