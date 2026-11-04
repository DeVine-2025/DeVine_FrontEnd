import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { getRecommendProjects } from '@apis/recommend';
import { reportQueries } from '@apis/report/report-queries';
import { createBookmark, deleteBookmark } from '@apis/bookmarks';
import { useBookmarks } from '@hooks/useBookmarks';
import { RecommendationBasis, RecommendationMenu, RecommendationSkeleton, RecommendationState } from './recommendation-ui';
import { recommendationMockProjects } from './recommendation-mock-data';
import RecommendationProjectCard from './RecommendationProjectCard';
import ViewToggle from '@components/common/ViewToggle';
import SearchIcon from '@assets/icons/search.svg?react';
import '../search/project/project-explore-page.css';

export default function RecommendationProjects() {
  const { getToken, isSignedIn, isLoaded, userId } = useAuth();
  const client = useQueryClient();
  const [domain, setDomain] = useState('all');
  const [mode, setMode] = useState('all');
  const [openOnly, setOpenOnly] = useState(false);
  const [sort, setSort] = useState('recommended');
  const [view, setView] = useState<'list' | 'grid'>('grid');
  const [search, setSearch] = useState('');
  const [previewBookmarks, setPreviewBookmarks] = useState<string[]>([]);
  const reports = useQuery({ ...reportQueries.report(), enabled: !!isSignedIn });
  const hasReport = (reports.data?.result.reports.length ?? 0) > 0;
  const projects = useQuery({ queryKey: ['recommendation-projects', userId], enabled: !!isSignedIn && hasReport, queryFn: async ({ signal }) => { const token = await getToken(); if (!token) throw new Error('로그인이 필요합니다.'); return getRecommendProjects(token, '', signal); } });
  const { data: bookmarks = [] } = useBookmarks();
  const isMock = import.meta.env.DEV && (!projects.data?.list.length);
  const all = isMock ? recommendationMockProjects : projects.data?.list ?? [];
  const domains = [...new Set(all.map(project => project.deadlineLabel || project.categoryLabel).filter(Boolean))];
  const modes = [...new Set(all.map(project => project.mode).filter(Boolean))];
  const list = all.filter(project => (domain === 'all' || (project.deadlineLabel || project.categoryLabel) === domain) && (mode === 'all' || project.mode === mode) && (!openOnly || (project.daysUntilDeadline != null && project.daysUntilDeadline >= 0)) && [project.title, project.categoryLabel, ...(project.roles ?? []).flatMap(role => role.techStack?.map(stack => stack.name) ?? [])].some(value => (value ?? "").toLowerCase().includes(search.trim().toLowerCase())));
  if (sort === 'deadline') list.sort((a, b) => (a.daysUntilDeadline == null || a.daysUntilDeadline < 0 ? Infinity : a.daysUntilDeadline) - (b.daysUntilDeadline == null || b.daysUntilDeadline < 0 ? Infinity : b.daysUntilDeadline));
  const reset = () => { setDomain('all'); setMode('all'); setOpenOnly(false); };
  return <div className="rec-project-page">
    <RecommendationBasis />
    {isMock && <p className="rec-preview-notice">디자인 미리보기 · 홈 목데이터를 표시하고 있어요. 적합도와 추천 근거는 예시입니다.</p>}
    {!isMock && !isLoaded ? <RecommendationSkeleton /> : !isMock && !isSignedIn ? <RecommendationState title="나에게 맞는 프로젝트를 만나보세요" description="로그인하고 GitHub 분석 기반의 맞춤 추천을 받아보세요." to="/login" action="로그인하고 추천 받기" /> : !isMock && reports.isPending ? <RecommendationSkeleton /> : !isMock && reports.isError ? <RecommendationState title="리포트를 확인하지 못했어요" description="잠시 후 다시 시도해 주세요." retry={() => void reports.refetch()} /> : !isMock && !hasReport ? <RecommendationState title="리포트로 나에게 맞는 팀을 찾아보세요" description="GitHub 분석 리포트를 생성하면 기술 역량과 관심 분야를 바탕으로 프로젝트를 추천해 드려요." to="/report/create" action="분석 리포트 만들기" /> : <>
      <div className="recommend-explore-layout"><aside className="explore-sidebar" aria-label="추천 프로젝트 필터"><div className="explore-sidebar-title"><strong>필터</strong><button type="button" onClick={reset}>전체 초기화</button></div><div className="rec-filters"><span className="rec-filter-label"><SlidersHorizontal size={14} />추천 좁혀보기</span><label className="rec-open-only"><input type="checkbox" checked={openOnly} onChange={event => setOpenOnly(event.target.checked)} />모집 중만</label><RecommendationMenu label="관심 분야" value={domain} options={[{ value: 'all', label: '관심 분야 전체' }, ...domains.map(value => ({ value, label: value }))]} onChange={setDomain} /><RecommendationMenu label="진행 방식" value={mode} options={[{ value: 'all', label: '진행 방식 전체' }, ...modes.map(value => ({ value, label: value }))]} onChange={setMode} />{(domain !== 'all' || mode !== 'all' || openOnly) && <button className="rec-reset" onClick={reset}>초기화</button>}</div></aside><div className="explore-main"><label className="explore-search"><SearchIcon aria-hidden="true" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="프로젝트명, 키워드, 기술 스택을 검색해보세요." aria-label="추천 프로젝트 검색" /></label>
      <div className="rec-toolbar"><div className="explore-view-controls"><RecommendationMenu label="추천 정렬" value={sort} options={[{ value: 'recommended', label: '추천순' }, { value: 'deadline', label: '마감 임박순' }]} onChange={setSort} /><ViewToggle value={view} onChange={setView} /></div></div>
      {!isMock && projects.isPending ? <RecommendationSkeleton /> : !isMock && projects.isError ? <RecommendationState title="추천을 불러오지 못했어요" description="연결 상태를 확인하고 다시 시도해 주세요." retry={() => void projects.refetch()} /> : !list.length ? <RecommendationState title="조건에 맞는 추천 프로젝트가 없어요" description="조건을 줄이거나 탐색에서 더 많은 프로젝트를 만나보세요." to="/search/projects" action="프로젝트 탐색하기" /> : <><div className={`rec-home-projects rec-home-projects--${view}`}>{list.map(project => { const bookmark = bookmarks.find(item => item.targetType === 'PROJECT' && item.targetId === Number(project.id)); return <RecommendationProjectCard project={project} variant={view} key={project.id} saved={isMock ? previewBookmarks.includes(project.id) : !!bookmark} onBookmark={async next => { if (isMock) { setPreviewBookmarks(current => next ? [...current, project.id] : current.filter(id => id !== project.id)); return; } const token = await getToken(); if (!token) throw new Error('로그인이 필요합니다.'); if (next) await createBookmark({ targetType: 'PROJECT', targetId: Number(project.id) }, token); else if (bookmark) await deleteBookmark(bookmark.bookmarkId, token); await client.invalidateQueries({ queryKey: ['bookmarks'] }); }} />; })}</div><p className="rec-end">나에게 맞는 추천을 모두 살펴봤어요. <Link to="/search/projects">더 많은 프로젝트 탐색하기 →</Link></p></>}
    </div></div></>}
  </div>;
}
