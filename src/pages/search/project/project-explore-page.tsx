import ExploreProjectCard from './explore-project-card';
import ChevronIcon from '@assets/icons/chevron-down.svg?react';
import SearchIcon from '@assets/icons/search.svg?react';
import DomainBadge from '@components/common/DomainBadge';
import ExploreTechBadges from './explore-tech-badges';
import ExploreTabs from '../explore-tabs';
import ExploreSelectedFilters from '../explore-selected-filters';
import { DOMAIN_OPTIONS } from '@constants/domain';
import { PERIOD_TO_DURATION } from '@mappers/projectFilters';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { featuredProjects, recentProjects, type HomeProject } from '../../home/home-mock-data';
import './project-explore-page.css';

const projects = [...new Map([...featuredProjects, ...recentProjects].map(project => [project.id, project])).values()];
type FilterKey = 'status' | 'domain' | 'tech' | 'role' | 'mode' | 'members' | 'duration';
type Filters = Record<FilterKey, string[]>;
const emptyFilters = (): Filters => ({ status: [], domain: [], tech: [], role: [], mode: [], members: [], duration: [] });
const labels: Record<FilterKey, string> = { status: '모집 상태', domain: '카테고리', tech: '기술 스택', role: '모집 직군', mode: '진행 방식', members: '모집 인원', duration: '예상 기한' };
const statusLabels: Record<HomeProject['status'], string> = { recruiting: '모집 중', inProgress: '진행 중', completed: '완료' };
const unique = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b, 'ko'));
const options: Record<FilterKey, string[]> = {
  status: ['모집 중', '진행 중', '완료'],
  domain: ['전체', ...DOMAIN_OPTIONS],
  tech: unique(projects.flatMap(p => p.techStacks)),
  role: unique(projects.flatMap(p => p.recruiting.split(' · '))),
  mode: unique(projects.map(p => p.workMode)),
  members: ['3명 이하', '4명', '5명 이상'],
  duration: Object.keys(PERIOD_TO_DURATION),
};
const keys = Object.keys(labels) as FilterKey[];
const PROJECT_BATCH_SIZE = 6;
const sortOptions = [
  { value: 'latest', label: '기본순' },
  { value: 'deadline', label: '마감 임박순' },
  { value: 'name', label: '이름순' },
];

function FilterGroup({ label, initiallyOpen, children }: { label: string; initiallyOpen: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(initiallyOpen);
  return <section className={`explore-filter-group ${open ? 'is-open' : ''}`}>
    <button type="button" className="explore-filter-heading" aria-expanded={open} onClick={() => setOpen(current => !current)}>{label}<ChevronIcon aria-hidden="true" /></button>
    <div className="explore-filter-panel" inert={!open}><div className="explore-filter-panel-inner">{children}</div></div>
  </section>;
}

function SortMenu({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener('pointerdown', onOutsideClick);
    document.addEventListener('keydown', onEscape);
    return () => { document.removeEventListener('pointerdown', onOutsideClick); document.removeEventListener('keydown', onEscape); };
  }, [open]);
  return <div ref={containerRef} className="explore-sort">
    <button ref={triggerRef} type="button" className="explore-sort-trigger" aria-label={`정렬: ${sortOptions.find(option => option.value === value)?.label}`} aria-expanded={open} aria-controls="explore-sort-options" onClick={() => setOpen(current => !current)}>
      {sortOptions.find(option => option.value === value)?.label}<ChevronIcon aria-hidden="true" />
    </button>
    {open && <div id="explore-sort-options" className="explore-sort-menu" role="group" aria-label="정렬 방식">
      {sortOptions.map(option => <button type="button" key={option.value} aria-pressed={option.value === value} onClick={() => { onChange(option.value); setOpen(false); triggerRef.current?.focus(); }}>{option.label}{option.value === value && <span aria-hidden="true">✓</span>}</button>)}
    </div>}
  </div>;
}

function matches(project: HomeProject, key: FilterKey, value: string) {
  switch (key) {
    case 'status': return statusLabels[project.status] === value;
    case 'domain': return project.domain === value;
    case 'tech': return project.techStacks.includes(value);
    case 'role': return project.recruiting.split(' · ').includes(value);
    case 'mode': return project.workMode === value;
    case 'members': return value === '3명 이하' ? project.memberCount.total <= 3 : value === '4명' ? project.memberCount.total === 4 : project.memberCount.total >= 5;
    case 'duration': {
      const normalized = project.duration.replace(/\s/g, '').replace('~', '-');
      if (normalized.includes('-')) return normalized === value;
      const months = Number.parseFloat(normalized);
      if (!Number.isFinite(months)) return false;
      return value === '1개월 이하' ? months <= 1 : value === '1-3개월' ? months > 1 && months <= 3 : value === '3-6개월' ? months > 3 && months < 6 : months >= 6;
    }
  }
}

export default function ProjectExplorePage() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [query, setQuery] = useState('');
  const [techQuery, setTechQuery] = useState('');
  const [sort, setSort] = useState('latest');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const [preview, setPreview] = useState<HomeProject | null>(null);
  const [visibleCount, setVisibleCount] = useState(PROJECT_BATCH_SIZE);
  const searchRef = useRef<HTMLInputElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const previousPositions = useRef<Map<string, DOMRect> | null>(null);
  const capturePositions = () => {
    const cards = projectsRef.current?.querySelectorAll<HTMLElement>('.explore-card') ?? [];
    const positions = new Map<string, DOMRect>();
    cards.forEach(card => {
      if (card.dataset.projectId) positions.set(card.dataset.projectId, card.getBoundingClientRect());
      card.getAnimations().forEach(animation => animation.cancel());
    });
    previousPositions.current = positions;
  };
  const changeView = (next: 'list' | 'grid') => {
    if (next === view) return;
    capturePositions();
    setView(next);
  };
  useLayoutEffect(() => {
    const positions = previousPositions.current;
    previousPositions.current = null;
    if (!positions || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    projectsRef.current?.querySelectorAll<HTMLElement>('.explore-card').forEach((card, index) => {
      const previous = card.dataset.projectId && positions.get(card.dataset.projectId);
      if (!previous) {
        card.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 320, delay: Math.min(index, 7) * 18, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' });
        return;
      }
      const next = card.getBoundingClientRect();
      card.animate([
        { transform: `translate(${previous.left - next.left}px, ${previous.top - next.top}px)`, opacity: 0.72 },
        { transform: 'translate(0, 0)', opacity: 1 },
      ], { duration: 380, delay: Math.min(index, 7) * 18, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' });
    });
  }, [view, filters, query]);
  const toggle = (key: FilterKey, value: string) => { capturePositions(); setVisibleCount(PROJECT_BATCH_SIZE); setFilters(current => ({ ...current, [key]: value === '전체' ? [] : current[key].includes(value) ? current[key].filter(item => item !== value) : [...current[key], value] })); };
  const reset = () => { capturePositions(); setVisibleCount(PROJECT_BATCH_SIZE); setFilters(emptyFilters()); setQuery(''); setTechQuery(''); };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchRef.current?.focus(); }
      if (event.key === 'Escape') setPreview(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const result = projects.filter(project => (!term || [project.title, project.description, project.domain, ...project.tags, ...project.techStacks].some(value => value.toLowerCase().includes(term))) && keys.every(key => !filters[key].length || filters[key].some(value => matches(project, key, value))));
    if (sort === 'deadline') return [...result].sort((a, b) => a.deadline.remaining - b.deadline.remaining);
    if (sort === 'name') return [...result].sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    return result;
  }, [filters, query, sort]);
  const hasMore = visibleCount < filtered.length;
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!hasMore || !target || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) setVisibleCount(count => Math.min(count + PROJECT_BATCH_SIZE, filtered.length));
    }, { rootMargin: '0px 0px 200px 0px' });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, visibleCount, filtered.length]);

  return <div className="project-explore">
    <Helmet><title>프로젝트 탐색 | Devine</title></Helmet>
    <aside className="explore-sidebar" aria-label="프로젝트 필터">
      <div className="explore-sidebar-title"><strong>필터</strong><button type="button" onClick={reset}>전체 초기화</button></div>
      {keys.map(key => <FilterGroup key={key} label={labels[key]} initiallyOpen={key === 'status' || key === 'domain' || key === 'tech'}>
        {key === 'tech' && <label className="explore-tech-search"><SearchIcon aria-hidden="true" /><input value={techQuery} onChange={event => setTechQuery(event.target.value)} placeholder="기술 스택 검색" aria-label="기술 스택 검색" /></label>}
        {options[key].filter(option => key !== 'tech' || option.toLowerCase().includes(techQuery.toLowerCase())).map(option => <label className={`explore-filter-option ${(option === '전체' ? filters[key].length === 0 : filters[key].includes(option)) ? 'selected' : ''}`} key={option}>
          <input type="checkbox" checked={option === '전체' ? filters[key].length === 0 : filters[key].includes(option)} onChange={() => toggle(key, option)} /> <span>{option}</span>
        </label>)}
      </FilterGroup>)}
    </aside>
    <div className="explore-main">
      <ExploreTabs />
      <div className="explore-title"><h1>프로젝트 탐색</h1><p>새로운 아이디어와 함께할 팀원을 찾아보세요.</p></div>
      <label className="explore-search"><SearchIcon aria-hidden="true" /><input ref={searchRef} value={query} onChange={event => { capturePositions(); setVisibleCount(PROJECT_BATCH_SIZE); setQuery(event.target.value); }} placeholder="프로젝트명, 키워드, 기술 스택을 검색해보세요." aria-label="프로젝트 검색" /><kbd>Ctrl / ⌘ K</kbd></label>
      <ExploreSelectedFilters items={keys.flatMap(key => filters[key].map(value => ({ id: `${key}:${value}`, label: value, group: labels[key], onRemove: () => toggle(key, value) })))} onClear={() => { capturePositions(); setVisibleCount(PROJECT_BATCH_SIZE); setFilters(emptyFilters()); }} />
      <div className="explore-toolbar">
        <div className="explore-view-controls"><SortMenu value={sort} onChange={value => { setVisibleCount(PROJECT_BATCH_SIZE); setSort(value); }} /><div className="explore-view-toggle" aria-label="보기 방식"><button type="button" aria-label="리스트 보기" title="리스트 보기" aria-pressed={view === 'list'} onClick={() => changeView('list')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01" strokeWidth="3"/></svg></button><button type="button" aria-label="그리드 보기" title="그리드 보기" aria-pressed={view === 'grid'} onClick={() => changeView('grid')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg></button></div></div>
      </div>
      <div ref={projectsRef} className={`explore-projects explore-projects-${view}`}>
        {filtered.slice(0, visibleCount).map(project => <ExploreProjectCard key={project.id} project={project} saved={saved.has(project.id)} onOpen={() => setPreview(project)} onBookmarkChange={(next) => setSaved(current => { const updated = new Set(current); if (next) updated.add(project.id); else updated.delete(project.id); return updated; })} />)}
        {filtered.length === 0 && <div className="explore-empty"><strong>조건에 맞는 프로젝트가 없어요.</strong><p>검색어나 필터를 바꿔 다시 찾아보세요.</p><button type="button" onClick={reset}>필터 초기화</button></div>}
      </div>
      {hasMore && <div ref={loadMoreRef} className="explore-load-more">{typeof IntersectionObserver === 'undefined' && <button type="button" onClick={() => setVisibleCount(count => Math.min(count + PROJECT_BATCH_SIZE, filtered.length))}>프로젝트 더 보기</button>}</div>}
    </div>
    {preview && <div className="explore-modal-backdrop" onClick={() => setPreview(null)}><section className="explore-modal" role="dialog" aria-modal="true" aria-labelledby="explore-modal-title" onClick={event => event.stopPropagation()}><button className="explore-modal-close" type="button" onClick={() => setPreview(null)} aria-label="닫기">×</button><DomainBadge className="explore-domain" domain={preview.domain} /><h2 id="explore-modal-title">{preview.title}</h2><p>{preview.introduction}</p><dl><dt>모집 직군</dt><dd>{preview.recruiting}</dd><dt>진행 방식</dt><dd>{preview.workMode}</dd><dt>예상 기간</dt><dd>{preview.duration}</dd></dl><ExploreTechBadges stacks={preview.techStacks} /></section></div>}
  </div>;
}
