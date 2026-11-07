import { sampleTeamProjects, getSampleTeamDevelopers } from './recommendation-team-samples';
import type { RecommendDeveloperListItem } from '@apis/members';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMyRecruitingProjects } from '@hooks/useMyRecruitingProjects';
import { useBookmarks } from '@hooks/useBookmarks';
import { getRecommendMembers } from '@apis/members';
import { normalizeTechstackName } from '@apis/techstacks';
import { createBookmark, deleteBookmark } from '@apis/bookmarks';
import { getCollaborationPreview } from '@components/cards/developer-collaboration-preview';
import DeveloperCard from '@components/cards/DeveloperCard';
import TechStackPicker from '@components/common/TechStackPicker';
import ViewToggle from '@components/common/ViewToggle';
import {
  ArrowRight, CalendarClock, CalendarDays, CalendarRange, Check, ChevronDown, Clock3,
  CodeXml, Folder, Globe, Layers2, MapPin, Monitor, SearchX, Server, UsersRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchIcon from '@assets/icons/search.svg?react';
import '../search/project/project-explore-page.css';
import '../search/developer/developer-explore-page.css';
import { RecommendationMenu, RecommendationSkeleton, RecommendationState } from './recommendation-ui';

const emptyFilters = { method: '', schedule: '', position: '', stack: [] as string[] };
const stackKey = (name: string) => normalizeTechstackName(name).replace(/_/g, '');

export default function RecommendationDevelopers() {
  const { isSignedIn, isLoaded, getToken, userId } = useAuth();
  const client = useQueryClient();
  const projects = useMyRecruitingProjects();
  const [selected, setSelected] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('grid');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(emptyFilters);
  const [stackPickerOpen, setStackPickerOpen] = useState(false);
  const selectedStacks = new Set(filters.stack.map(stackKey));
  const filtersActive = Boolean(filters.method || filters.schedule || filters.position || selectedStacks.size);
  const hasSearchConditions = filtersActive || Boolean(search.trim());
  const resetFilters = () => setFilters(emptyFilters);
  const options = [...sampleTeamProjects, ...(projects.data ?? [])];
  const [sampleBookmarks, setSampleBookmarks] = useState<string[]>([]);
  const [sampleDeveloper, setSampleDeveloper] = useState<RecommendDeveloperListItem | null>(null);
  const sampleDialog = useRef<HTMLDialogElement>(null);
  const project = options.find(item => String(item.projectId) === selected) ?? options[0];
  const isSample = !!project && project.projectId < 0;
  const { data: bookmarks = [] } = useBookmarks();
  const loader = useRef<HTMLDivElement>(null);
  const developers = useInfiniteQuery({
    queryKey: ['recommendation-developers', userId, project?.projectId],
    enabled: !!isSignedIn && !!project && project.projectId > 0,
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => { const token = await getToken(); if (!token || !project || project.projectId <= 0) throw new Error('추천 기준을 확인해 주세요.'); return getRecommendMembers(token, { projectId: project.projectId, page: pageParam, size: 9 }, signal); },
    getNextPageParam: page => page.last || page.page >= page.totalPages ? undefined : page.page + 1,
  });
  const realList = [...new Map(developers.data?.pages.flatMap(page => page.list).map(item => [item.nickname, item])).values()];
  const { isFetchingNextPage, isFetchNextPageError, fetchNextPage } = developers;
  const hasNextPage = !isSample && developers.hasNextPage;
  useEffect(() => {
    if ((search.trim() || filtersActive) && hasNextPage && !developers.isFetching && !isFetchNextPageError) void fetchNextPage();
  }, [search, filtersActive, hasNextPage, developers.isFetching, isFetchNextPageError, fetchNextPage]);
  useEffect(() => {
    const target = loader.current;
    if (!target || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return;
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) void fetchNextPage(); }, { rootMargin: '200px' });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);
  const candidates = isSample ? getSampleTeamDevelopers(project.projectId) : realList;
  const filterGroups = [
    {
      key: 'schedule', label: '가능 시간대', Icon: Clock3,
      options: [
        { label: '평일 저녁', Icon: CalendarClock },
        { label: '주말 중심', Icon: CalendarDays },
        { label: '일정 협의', Icon: CalendarRange },
      ],
    },
    { key: 'stack', label: '기술 스택' },
    {
      key: 'position', label: '포지션', Icon: Layers2,
      options: [
        { label: '프론트엔드', Icon: Monitor },
        { label: '백엔드', Icon: CodeXml },
        { label: '인프라', Icon: Server },
      ],
    },
    {
      key: 'method', label: '협업 방식', Icon: UsersRound,
      options: [
        { label: '온라인 협업', Icon: Globe },
        { label: '오프라인 협업', Icon: MapPin },
        { label: '온·오프라인 협업', Icon: Layers2 },
      ],
    },
  ] as const;
  const filtered = candidates.filter(developer => {
    const { method, schedule } = getCollaborationPreview(developer.nickname);
    const role = developer.role.toLowerCase().replace(/[\s_-]/g, '');
    const position = /frontend|프론트엔드/.test(role) ? '프론트엔드'
      : /backend|백엔드/.test(role) ? '백엔드' : /infra|인프라/.test(role) ? '인프라' : '';
    return (!filters.method || method === filters.method)
      && (!filters.schedule || schedule === filters.schedule)
      && (!filters.position || position === filters.position)
      && (!selectedStacks.size || developer.techStack.some(stack => selectedStacks.has(stackKey(stack.name))))
      && [developer.nickname, developer.introduction ?? '', ...developer.techStack.map(stack => stack.name)]
        .some(value => value.toLowerCase().includes(search.trim().toLowerCase()));
  });
  return <>
    {!isSample && !isLoaded ? <RecommendationSkeleton /> : !isSample && !isSignedIn ? <RecommendationState title="함께할 팀원을 추천받아 보세요" description="로그인하고 내 프로젝트에 맞는 개발자를 만나보세요." to="/login" action="로그인하고 추천 받기" /> : !isSample && projects.isPending ? <RecommendationSkeleton /> : !isSample && projects.isError ? <RecommendationState title="내 프로젝트를 불러오지 못했어요" description="잠시 후 다시 시도해 주세요." retry={() => void projects.refetch()} /> : !project ? <RecommendationState title="어떤 프로젝트를 함께 만들까요?" description="프로젝트를 등록하면 필요한 기술과 포지션에 맞는 개발자를 추천해 드려요." to="/project/create" action="프로젝트 등록하기" /> : <>
      <div className="recommend-workspace">
        <aside className="recommend-project-rail" aria-label="추천 기준 프로젝트">
          <div className="recommend-rail-heading"><h2>내 프로젝트</h2><p>팀원을 찾을 프로젝트를 선택하세요.</p></div>
          <nav aria-label="내 프로젝트 선택" className="recommend-project-list">
            {options.map(item => <button type="button" key={item.projectId} aria-pressed={item.projectId === project.projectId} onClick={() => { if (item.projectId !== project.projectId) { setSelected(String(item.projectId)); resetFilters(); } }} className="recommend-project-option">
              <Folder size={18} strokeWidth={1.6} aria-hidden="true" />
              <span>{item.title}</span>
              {item.projectId === project.projectId && <Check size={16} aria-hidden="true" />}
            </button>)}
          </nav>
          <p className="recommend-rail-note">프로젝트를 바꾸면 추천 개발자도 함께 바뀝니다.</p>
        </aside>
        <div className="recommend-candidates explore-main">
          <div className="recommend-result-controls">
            <label className="explore-search"><SearchIcon aria-hidden="true" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="이름, 소개, 기술 스택 검색" aria-label="추천 개발자 검색" /></label>
            <ViewToggle value={view} onChange={setView} />
          </div>
          <div className="recommend-position-bar" role="group" aria-label="추천 개발자 필터">
            {filterGroups.map((group) => group.key === 'stack' ? (
              <button
                key={group.key}
                type="button"
                className="rec-menu-trigger"
                aria-haspopup="dialog"
                data-filter-active={selectedStacks.size > 0 || undefined}
                onClick={() => setStackPickerOpen(true)}
              >
                <span className="rec-menu-trigger-content">
                  <CodeXml size={14} aria-hidden="true" />
                  <span className="rec-menu-trigger-label">{group.label}{selectedStacks.size > 0 && ` (${selectedStacks.size})`}</span>
                </span>
                <ChevronDown size={14} aria-hidden="true" />
              </button>
            ) : (
              <RecommendationMenu
                developerFilter
                key={group.key}
                label={filters[group.key] ? `${group.label}: ${filters[group.key]}` : group.label}
                value={filters[group.key]}
                icon={<group.Icon size={14} aria-hidden="true" />}
                options={group.options.map(({ label, Icon }) => ({
                  value: label,
                  label,
                  icon: <Icon size={14} aria-hidden="true" />,
                }))}
                onChange={value => setFilters(current => ({ ...current, [group.key]: value }))}
              />
            ))}
            {filtersActive && <button className="recommend-filter-reset" type="button" onClick={resetFilters}>필터 초기화</button>}
          </div>
      {(!isSample && developers.isPending || (!filtered.length && !!hasNextPage && !isFetchNextPageError)) ? <RecommendationSkeleton /> : !isSample && developers.isError && !developers.data ? <RecommendationState title="추천 개발자를 불러오지 못했어요" description="연결 상태를 확인한 후 다시 시도해 주세요." retry={() => void developers.refetch()} /> : !filtered.length ? <section className="recommend-developer-empty" aria-labelledby="recommend-empty-title">
        <div className="recommend-empty-icon"><SearchX size={22} aria-hidden="true" /></div>
        <div className="recommend-empty-copy">
          <h2 id="recommend-empty-title">{hasSearchConditions ? '조건에 맞는 개발자가 없어요' : '아직 추천 개발자가 없어요'}</h2>
          <p>{hasSearchConditions ? '검색어나 필터를 조정해 다시 찾아보세요.' : '다른 프로젝트를 선택하거나 탐색에서 개발자를 찾아보세요.'}</p>
          <div className="recommend-empty-actions">
            {hasSearchConditions && <button type="button" onClick={() => { setSearch(''); resetFilters(); }}>검색 조건 초기화</button>}
            <Link to="/search/developers">개발자 탐색하기 <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
        </div>
      </section> : <div className={`developer-explore-list developer-explore-${view}`}>{filtered.map(developer => {
        const bookmark = bookmarks.find(item => item.targetType === 'DEVELOPER' && (item.targetNickname === developer.nickname || (developer.memberId != null && item.targetId === developer.memberId)));
        return <DeveloperCard key={developer.nickname} developer={{ member: { nickname: developer.nickname, address: null, disclosure: true, mainType: 'DEVELOPER', imageUrl: developer.profileImageUrl || null, body: developer.introduction || null, used: '', createdAt: '' }, domains: (developer.domains ?? []).map(domain => domain.label), techstacks: developer.techStack.map((stack, index) => ({ techstackId: index, name: stack.name, genre: 'skill', source: 'MANUAL' })) }} roleLabel={developer.role} variant={view} showTechStacks={selectedStacks.size > 0} onOpen={isSample ? () => { setSampleDeveloper(developer); sampleDialog.current?.showModal(); } : undefined} bookmarked={isSample ? sampleBookmarks.includes(developer.id) : !!bookmark} pending={false} onBookmarkChange={async next => { if (isSample) { setSampleBookmarks(current => next ? [...current, developer.id] : current.filter(id => id !== developer.id)); return; } const token = await getToken(); if (!token) throw new Error('로그인이 필요합니다.'); if (next) await createBookmark({ targetType: 'DEVELOPER', targetNickname: developer.nickname }, token); else if (bookmark) await deleteBookmark(bookmark.bookmarkId, token); await client.invalidateQueries({ queryKey: ['bookmarks'] }); }} />;
      })}</div>}
      <div ref={loader} className="rec-load-more" role="status">{isFetchingNextPage ? '추천 개발자를 더 불러오고 있어요…' : isFetchNextPageError ? <button className="rec-menu-trigger" onClick={() => void fetchNextPage()}>추가 추천 다시 불러오기</button> : !hasNextPage && filtered.length > 0 ? '추천 개발자를 모두 살펴봤어요.' : null}</div>
    </div></div></>}
    {stackPickerOpen && (
      <TechStackPicker
        title="기술 스택 선택"
        description="추천 개발자 목록에서 찾을 기술을 선택하세요."
        value={filters.stack}
        onApply={(stack) => setFilters((current) => ({ ...current, stack }))}
        onClose={() => setStackPickerOpen(false)}
      />
    )}
    <dialog ref={sampleDialog} className="rec-preview-dialog" aria-label="샘플 개발자 프로필">
      <span className="rec-preview-label">샘플 개발자</span><h2>{sampleDeveloper?.nickname}</h2>
      <p>{sampleDeveloper?.role}</p><p>{sampleDeveloper?.introduction}</p>
      <p>{sampleDeveloper?.techStack.map(stack => stack.name).join(', ')}</p>
      <button type="button" className="rec-primary" onClick={() => sampleDialog.current?.close()}>닫기</button>
    </dialog>
  </>;
}
