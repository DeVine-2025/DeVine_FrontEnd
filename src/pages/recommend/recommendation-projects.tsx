import { useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarDays, CircleCheck, SlidersHorizontal, Users } from 'lucide-react';
import { getRecommendProjects, type ProjectListItem } from '@apis/recommend';
import { reportQueries } from '@apis/report/report-queries';
import { createBookmark, deleteBookmark } from '@apis/bookmarks';
import { useBookmarks } from '@hooks/useBookmarks';
import BookmarkButton from '@components/common/BookmarkButton';
import DomainBadge from '@components/common/DomainBadge';
import { DOMAIN_OPTIONS, type Domain } from '@constants/domain';
import DefaultImage from '@assets/images/devine-symbol.png';
import ExploreTechBadges from '../search/project/explore-tech-badges';
import { RecommendationBasis, RecommendationMenu, RecommendationSkeleton, RecommendationState } from './recommendation-ui';
import { recommendationMockProjects, recommendationMockSources } from './recommendation-mock-data';

function ProjectCard({ project, saved, onBookmark }: { project: ProjectListItem; saved: boolean; onBookmark: (next: boolean) => Promise<void> }) {
  const previewRef = useRef<HTMLDialogElement>(null);
  const mock = project.id.startsWith('preview-') ? recommendationMockSources.find(item => `preview-${item.id}` === project.id) : undefined;
  const openPreview = (event: React.MouseEvent<HTMLAnchorElement>) => { if (mock) { event.preventDefault(); previewRef.current?.showModal(); } };
  const roles = project.roles ?? [];
  const current = roles.reduce((sum, role) => sum + role.current, 0);
  const total = roles.reduce((sum, role) => sum + role.total, 0);
  const stacks = [...new Set(roles.flatMap(role => role.techStack?.map(stack => stack.name).filter((name): name is string => !!name) ?? []))];
  const score = project.totalScore != null && Number.isFinite(project.totalScore) ? project.totalScore : null;
  const percent = score != null && score >= 0 && score <= 100 ? score : null;
  const category = project.deadlineLabel || project.categoryLabel;
  const reason = project.techstackScorePercent != null ? `기술 스택 일치율 ${project.techstackScorePercent}%` : project.domainMatch ? '관심 도메인이 일치하는 프로젝트예요' : project.similarityScorePercent != null ? `리포트 유사도 ${project.similarityScorePercent}%` : '분석 리포트를 바탕으로 추천해요';
  const remaining = project.daysUntilDeadline;
  return <article className="rec-project-card">
    <Link to={mock ? '#' : `/project/${project.id}`} onClick={openPreview} className="rec-project-art" aria-label={`${project.title} 프로젝트 보기`}><img src={project.thumbnailUrl || DefaultImage} alt="" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = DefaultImage; }} className={project.thumbnailUrl ? 'has-thumbnail' : ''} />{remaining != null && <span className={`rec-status ${remaining < 0 ? 'closed' : ''}`}><i />{remaining < 0 ? '모집 마감' : mock?.status === 'inProgress' ? '진행 중' : '모집 중'}</span>}</Link>
    <BookmarkButton className="rec-bookmark" aria-label={project.title} bookmarked={saved} onBookmarkChange={onBookmark} />
    <div className="rec-project-body">
      {category && (DOMAIN_OPTIONS.includes(category as Domain) ? <DomainBadge className="rec-domain" domain={category as Domain} /> : <span className="rec-domain">{category}</span>)}
      <Link className="rec-card-title" to={mock ? '#' : `/project/${project.id}`} onClick={openPreview}>{project.title}</Link>
      <p className="rec-card-description">{mock?.description || [project.mode, project.location, project.period].filter(Boolean).join(' · ') || '프로젝트 상세에서 함께할 팀을 확인해 보세요.'}</p>
      <ExploreTechBadges stacks={stacks.slice(0, 4)} />
      <p className="rec-reason"><CircleCheck size={15} /><span>{reason}</span></p>
      <div className="rec-project-stats">
        <div className="rec-score"><span>추천 적합도</span>{percent != null ? <div className="rec-ring"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="27" /><circle cx="32" cy="32" r="27" pathLength="100" strokeDasharray={`${percent} 100`} /></svg><strong>{Math.round(score!)}</strong></div> : <strong className="rec-score-number">{score ?? '—'}</strong>}</div>
        <div className="rec-members"><span>모집 현황</span><strong><Users size={14} />{total > 0 ? `${current} / ${total}명` : '상세 확인'}</strong>{total > 0 && <div className="rec-progress" aria-label={`${total}명 중 ${current}명 모집`} >{Array.from({ length: Math.min(total, 20) }, (_, index) => <i key={index} className={index / Math.min(total, 20) < current / total ? 'filled' : ''} />)}</div>}</div>
        <div className="rec-deadline"><strong>{remaining == null ? '—' : remaining < 0 ? '마감' : remaining === 0 ? 'D-day' : `D-${remaining}`}</strong>{project.recruitmentDeadline && <span><CalendarDays size={13} />{project.recruitmentDeadline.slice(5, 10).replace('-', '.')}</span>}</div>
      </div>
      <details className="rec-score-details"><summary>추천 기준 자세히 보기</summary><p>{project.techstackScorePercent != null && <>기술 스택 일치율 {project.techstackScorePercent}%<br /></>}{project.similarityScorePercent != null && <>리포트 유사도 {project.similarityScorePercent}%<br /></>}{project.domainMatch != null && <>관심 도메인 {project.domainMatch ? '일치' : '불일치'}<br /></>}{score != null ? `종합 점수 ${score}` : '추천 API가 제공한 순서를 기준으로 표시합니다.'}</p></details>
    </div>
    {mock && <dialog ref={previewRef} className="rec-preview-dialog" aria-label={`${project.title} 예시 프로젝트`} onClick={event => { if (event.target === event.currentTarget) previewRef.current?.close(); }}><span className="rec-preview-label">목데이터 미리보기</span><h2>{mock.title}</h2><p>{mock.introduction}</p><ExploreTechBadges stacks={mock.techStacks} /><p>{mock.recruiting}<br />{mock.workMode} · {mock.duration}</p><button className="rec-primary" onClick={() => previewRef.current?.close()}>닫기</button></dialog>}
  </article>;
}

export default function RecommendationProjects() {
  const { getToken, isSignedIn, isLoaded, userId } = useAuth();
  const client = useQueryClient();
  const [domain, setDomain] = useState('all');
  const [mode, setMode] = useState('all');
  const [openOnly, setOpenOnly] = useState(false);
  const [sort, setSort] = useState('recommended');
  const [previewBookmarks, setPreviewBookmarks] = useState<string[]>([]);
  const reports = useQuery({ ...reportQueries.report(), enabled: !!isSignedIn });
  const hasReport = (reports.data?.result.reports.length ?? 0) > 0;
  const projects = useQuery({ queryKey: ['recommendation-projects', userId], enabled: !!isSignedIn && hasReport, queryFn: async ({ signal }) => { const token = await getToken(); if (!token) throw new Error('로그인이 필요합니다.'); return getRecommendProjects(token, '', signal); } });
  const { data: bookmarks = [] } = useBookmarks();
  const isMock = projects.isSuccess && projects.data.list.length === 0;
  const all = isMock ? recommendationMockProjects : projects.data?.list ?? [];
  const domains = [...new Set(all.map(project => project.deadlineLabel || project.categoryLabel).filter(Boolean))];
  const modes = [...new Set(all.map(project => project.mode).filter(Boolean))];
  const list = all.filter(project => (domain === 'all' || (project.deadlineLabel || project.categoryLabel) === domain) && (mode === 'all' || project.mode === mode) && (!openOnly || (project.daysUntilDeadline != null && project.daysUntilDeadline >= 0)));
  if (sort === 'deadline') list.sort((a, b) => (a.daysUntilDeadline == null || a.daysUntilDeadline < 0 ? Infinity : a.daysUntilDeadline) - (b.daysUntilDeadline == null || b.daysUntilDeadline < 0 ? Infinity : b.daysUntilDeadline));
  const reset = () => { setDomain('all'); setMode('all'); setOpenOnly(false); };
  return <>
    <RecommendationBasis />
    {isMock && <p className="rec-preview-notice">디자인 미리보기 · 홈 목데이터를 표시하고 있어요. 적합도와 추천 근거는 예시입니다.</p>}
    {!isLoaded ? <RecommendationSkeleton /> : !isSignedIn ? <RecommendationState title="나에게 맞는 프로젝트를 만나보세요" description="로그인하고 GitHub 분석 기반의 맞춤 추천을 받아보세요." to="/login" action="로그인하고 추천 받기" /> : reports.isPending ? <RecommendationSkeleton /> : reports.isError ? <RecommendationState title="리포트를 확인하지 못했어요" description="잠시 후 다시 시도해 주세요." retry={() => void reports.refetch()} /> : !hasReport ? <RecommendationState title="리포트로 나에게 맞는 팀을 찾아보세요" description="GitHub 분석 리포트를 생성하면 기술 역량과 관심 분야를 바탕으로 프로젝트를 추천해 드려요." to="/report/create" action="분석 리포트 만들기" /> : <>
      <div className="rec-toolbar"><div className="rec-filters"><span className="rec-filter-label"><SlidersHorizontal size={14} />추천 좁혀보기</span><label className="rec-open-only"><input type="checkbox" checked={openOnly} onChange={event => setOpenOnly(event.target.checked)} />모집 중만</label><RecommendationMenu label="관심 분야" value={domain} options={[{ value: 'all', label: '관심 분야 전체' }, ...domains.map(value => ({ value, label: value }))]} onChange={setDomain} /><RecommendationMenu label="진행 방식" value={mode} options={[{ value: 'all', label: '진행 방식 전체' }, ...modes.map(value => ({ value, label: value }))]} onChange={setMode} />{(domain !== 'all' || mode !== 'all' || openOnly) && <button className="rec-reset" onClick={reset}>초기화</button>}</div><RecommendationMenu label="추천 정렬" value={sort} options={[{ value: 'recommended', label: '추천순' }, { value: 'deadline', label: '마감 임박순' }]} onChange={setSort} /></div>
      {projects.isPending ? <RecommendationSkeleton /> : projects.isError ? <RecommendationState title="추천을 불러오지 못했어요" description="연결 상태를 확인하고 다시 시도해 주세요." retry={() => void projects.refetch()} /> : !list.length ? <RecommendationState title="조건에 맞는 추천 프로젝트가 없어요" description="조건을 줄이거나 탐색에서 더 많은 프로젝트를 만나보세요." to="/search/projects" action="프로젝트 탐색하기" /> : <><div className="rec-grid">{list.map(project => { const bookmark = bookmarks.find(item => item.targetType === 'PROJECT' && item.targetId === Number(project.id)); return <ProjectCard project={project} key={project.id} saved={isMock ? previewBookmarks.includes(project.id) : !!bookmark} onBookmark={async next => { if (isMock) { setPreviewBookmarks(current => next ? [...current, project.id] : current.filter(id => id !== project.id)); return; } const token = await getToken(); if (!token) throw new Error('로그인이 필요합니다.'); if (next) await createBookmark({ targetType: 'PROJECT', targetId: Number(project.id) }, token); else if (bookmark) await deleteBookmark(bookmark.bookmarkId, token); await client.invalidateQueries({ queryKey: ['bookmarks'] }); }} />; })}</div><p className="rec-end">나에게 맞는 추천을 모두 살펴봤어요. <Link to="/search/projects">더 많은 프로젝트 탐색하기 →</Link></p></>}
    </>}
  </>;
}
