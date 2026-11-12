import ViewToggle from '@components/common/ViewToggle';
import ProjectCard from '@components/cards/ProjectCard';
import ChevronIcon from '@assets/icons/chevron-down.svg?react';
import SearchIcon from '@assets/icons/search.svg?react';
import SortMenu from '@components/common/SortMenu';
import { getTechDisplayName } from '@components/cards/TechStackBadges';
import ExploreTabs from '../explore-tabs';
import ExploreSelectedFilters from '../explore-selected-filters';
import { DOMAIN_OPTIONS, DOMAIN_REVERSE_MAP, type Domain } from '@constants/domain';
import { buildParams, PERIOD_TO_DURATION, TECHSTACK_KEY_TO_NAME } from '@mappers/projectFilters';
import { getProjects } from '@apis/projects';
import { useBookmarks, useChangeBookmark } from '@hooks/useBookmarks';
import { useAuth } from '@clerk/clerk-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../../shared/config/data-mode';
import type { ProjectItem } from '@t/project/api';
import type { ProjectCardData } from '@components/cards/card-types';
import DefaultImage from '@assets/images/devine-symbol.png';
import { CardLoading } from '@components/common/LoadingLayouts';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { featuredProjects, recentProjects, type HomeProject } from '../../home/home-mock-data';
import '../explore-shared.css';

const projects = [...new Map([...featuredProjects, ...recentProjects].map(project => [project.id, project])).values()];
type ExploreProject = ProjectCardData & { tags: string[]; recruiting: string; introduction: string };
export function mapApiProject(item: ProjectItem): ExploreProject {
  const positions = item.positions ?? item.recruitments ?? [];
  const domain = DOMAIN_REVERSE_MAP[item.category ?? ''] ?? item.categoryName;
  const status = item.status === 'RECRUITING' ? 'recruiting' : item.status === 'IN_PROGRESS' ? 'inProgress' : item.status === 'COMPLETED' ? 'completed' : null;
  return { id: String(item.projectId), title: item.title, thumbnail: item.thumbnailUrl || item.imageUrls?.[0] || DefaultImage,
    domain: DOMAIN_OPTIONS.find(option => option === domain) as Domain | undefined ?? null,
    memberCount: { current: positions.reduce((sum, position) => sum + (position.currentCount ?? 0), 0), total: positions.reduce((sum, position) => sum + (position.count ?? 0), 0) },
    deadline: { remaining: typeof item.daysUntilDeadline === 'number' ? item.daysUntilDeadline : null, date: item.recruitmentDeadline ?? '' }, status,
    description: '', introduction: '', tags: [], recruiting: positions.map(position => position.positionName).filter(Boolean).join(' · '),
    techStacks: positions.flatMap(position => (position.techStacks ?? []).map(stack => stack.techStackName ?? stack.techStack ?? '').filter(Boolean)),
    duration: item.durationRangeName ?? (item.durationMonths ? `${item.durationMonths}개월` : ''), workMode: item.modeName ?? '' };
}
type FilterKey = 'status' | 'domain' | 'tech' | 'role' | 'mode' | 'members' | 'duration';
type Filters = Record<FilterKey, string[]>;
const emptyFilters = (): Filters => ({ status: [], domain: [], tech: [], role: [], mode: [], members: [], duration: [] });
const labels: Record<FilterKey, string> = { status: '모집 상태', domain: '카테고리', tech: '기술 스택', role: '모집 직군', mode: '진행 방식', members: '모집 인원', duration: '예상 기한' };
const statusLabels: Record<HomeProject['status'], string> = { recruiting: '모집 중', inProgress: '진행 중', completed: '완료' };
const unique = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b, 'ko'));
const options: Record<FilterKey, string[]> = {
  status: ['모집 중', '진행 중', '완료'],
  domain: ['전체', ...DOMAIN_OPTIONS],
  tech: useMockData ? unique(projects.flatMap(p => p.techStacks)) : unique(Object.keys(TECHSTACK_KEY_TO_NAME).map(getTechDisplayName)),
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

function matches(project: ExploreProject, key: FilterKey, value: string) {
  switch (key) {
    case 'status': return project.status !== null && statusLabels[project.status] === value;
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

export default function ProjectExplorePage({ mode = 'search' }: { mode?: 'search' | 'recommend' }) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [query, setQuery] = useState('');
  const [techQuery, setTechQuery] = useState('');
  const [sort, setSort] = useState('latest');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const [visibleCount, setVisibleCount] = useState(PROJECT_BATCH_SIZE);
  const { getToken, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const saveBookmark = useChangeBookmark();
  const { data: bookmarkItems = [] } = useBookmarks({ enabled: !useMockData && !!isSignedIn });
  const apiParams = buildParams({ projectTypes: [], domains: filters.domain, techStacks: filters.tech, expectedPeriods: filters.duration });
  const apiProjects = useInfiniteQuery({
    queryKey: ['explore-projects', apiParams], enabled: !useMockData, initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const params = new URLSearchParams(apiParams);
      params.set('page', String(pageParam)); params.set('size', '20');
      return getProjects(params.toString(), (await getToken()) ?? undefined, signal);
    },
    getNextPageParam: (page, _pages, pageParam) => page.last || pageParam >= (page.totalPages ?? 0) ? undefined : pageParam + 1,
  });
  const sourceProjects: ExploreProject[] = useMemo(() => useMockData ? projects : (apiProjects.data?.pages.flatMap(page => (page.content as ProjectItem[]).map(mapApiProject)) ?? []), [apiProjects.data]);
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
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const result = sourceProjects.filter(project => (!term || [project.title, project.description, project.domain ?? '', ...project.tags, ...project.techStacks].some(value => value.toLowerCase().includes(term))) && keys.every(key => !filters[key].length || (!useMockData && ['domain', 'tech', 'duration'].includes(key)) || filters[key].some(value => matches(project, key, value))));
    if (sort === 'deadline') return [...result].sort((a, b) => (a.deadline.remaining ?? Infinity) - (b.deadline.remaining ?? Infinity));
    if (sort === 'name') return [...result].sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    return result;
  }, [filters, query, sort, sourceProjects]);
  const hasMore = visibleCount < filtered.length || (!useMockData && apiProjects.hasNextPage);
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!hasMore || !target || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        if (visibleCount < filtered.length) setVisibleCount(count => Math.min(count + PROJECT_BATCH_SIZE, filtered.length));
        else if (!useMockData && apiProjects.hasNextPage && !apiProjects.isFetchingNextPage) void apiProjects.fetchNextPage();
      }
    }, { rootMargin: '0px 0px 200px 0px' });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, visibleCount, filtered.length, apiProjects.hasNextPage, apiProjects.isFetchingNextPage, apiProjects.fetchNextPage]);
  useEffect(() => {
    const needsFullResults = Boolean(query.trim()) || keys.some(key => filters[key].length > 0) || sort !== 'latest';
    if (!useMockData && needsFullResults && apiProjects.hasNextPage && !apiProjects.isFetching && !apiProjects.isFetchNextPageError) void apiProjects.fetchNextPage();
  }, [query, filters, sort, apiProjects.hasNextPage, apiProjects.isFetching, apiProjects.isFetchNextPageError, apiProjects.fetchNextPage]);
  const changeBookmark = async (project: ExploreProject, next: boolean) => {
    if (useMockData) { setSaved(current => { const updated = new Set(current); if (next) updated.add(project.id); else updated.delete(project.id); return updated; }); return; }
    const token = await getToken();
    if (!token) { navigate('/login'); return; }
    const bookmark = bookmarkItems.find(item => item.targetType === 'PROJECT' && item.targetId === Number(project.id));
    try {
      await saveBookmark({ targetType: 'PROJECT', targetId: Number(project.id) }, next, bookmark?.bookmarkId, token);
    } catch (error) { alert(error instanceof Error ? error.message : '북마크 처리에 실패했습니다.'); }
  };

  return <div className="project-explore desktop-content">
    <Helmet><title>프로젝트 {mode === 'recommend' ? '추천' : '탐색'} | Devine</title></Helmet>
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
      <div className="explore-title"><h1>{mode === 'recommend' ? '추천' : '탐색'}</h1><p>프로젝트와 함께할 팀원을 찾아보세요.</p></div>
      <ExploreTabs mode={mode} />
      <label className="explore-search"><SearchIcon aria-hidden="true" /><input ref={searchRef} value={query} onChange={event => { capturePositions(); setVisibleCount(PROJECT_BATCH_SIZE); setQuery(event.target.value); }} placeholder="프로젝트명, 키워드, 기술 스택을 검색해보세요." aria-label="프로젝트 검색" /><kbd>Ctrl / ⌘ K</kbd></label>
      <ExploreSelectedFilters items={keys.flatMap(key => filters[key].map(value => ({ id: `${key}:${value}`, label: value, group: labels[key], onRemove: () => toggle(key, value) })))} onClear={() => { capturePositions(); setVisibleCount(PROJECT_BATCH_SIZE); setFilters(emptyFilters()); }} />
      <div className="explore-toolbar">
        <div className="explore-view-controls"><SortMenu options={sortOptions} value={sort} onChange={value => { setVisibleCount(PROJECT_BATCH_SIZE); setSort(value); }} /><ViewToggle value={view} onChange={changeView} /></div>
      </div>
      {!useMockData && apiProjects.isPending && <CardLoading kind="project" view={view} />}
      {!useMockData && apiProjects.isError && !apiProjects.data && <div role="alert" className="explore-empty"><strong>프로젝트를 불러오지 못했어요.</strong><button type="button" onClick={() => void apiProjects.refetch()}>다시 시도</button></div>}
      <div ref={projectsRef} className={`explore-projects explore-projects-${view}`}>
        {filtered.slice(0, visibleCount).map(project => <ProjectCard key={project.id} project={project} saved={useMockData ? saved.has(project.id) : bookmarkItems.some(item => item.targetType === 'PROJECT' && item.targetId === Number(project.id))} variant={view} showTechStacks={false} onOpen={() => navigate(`/project/${useMockData ? `sample-${project.id}` : project.id}`)} onBookmarkChange={next => void changeBookmark(project, next)} />)}
        {filtered.length === 0 && (useMockData || (!apiProjects.isPending && !apiProjects.isError && !apiProjects.hasNextPage)) && <div className="explore-empty"><strong>조건에 맞는 프로젝트가 없어요.</strong><p>검색어나 필터를 바꿔 다시 찾아보세요.</p><button type="button" onClick={reset}>필터 초기화</button></div>}
      </div>
      {hasMore && <div ref={loadMoreRef} className="explore-load-more">{apiProjects.isFetchingNextPage ? '프로젝트를 불러오고 있어요…' : (typeof IntersectionObserver === 'undefined' || apiProjects.isFetchNextPageError) && <button type="button" onClick={() => { if (visibleCount < filtered.length) setVisibleCount(count => Math.min(count + PROJECT_BATCH_SIZE, filtered.length)); else void apiProjects.fetchNextPage(); }}>프로젝트 더 보기</button>}</div>}
    </div>
  </div>;
}
