import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CircleCheck } from 'lucide-react';
import { useMyRecruitingProjects } from '@hooks/useMyRecruitingProjects';
import { useBookmarks } from '@hooks/useBookmarks';
import { getRecommendMembers } from '@apis/members';
import { createBookmark, deleteBookmark } from '@apis/bookmarks';
import BookmarkButton from '@components/common/BookmarkButton';
import DefaultProfile from '@assets/images/Profile_dark.svg';
import ExploreTechBadges from '../search/project/explore-tech-badges';
import { recommendationMockDevelopers, recommendationMockDeveloperProjects, recommendationMockSources } from './recommendation-mock-data';
import { RecommendationBasis, RecommendationMenu, RecommendationSkeleton, RecommendationState } from './recommendation-ui';

export default function RecommendationDevelopers() {
  const { isSignedIn, isLoaded, getToken, userId } = useAuth();
  const client = useQueryClient();
  const projects = useMyRecruitingProjects();
  const [selected, setSelected] = useState('');
  const [previewBookmarks, setPreviewBookmarks] = useState<string[]>([]);
  const [previewDeveloper, setPreviewDeveloper] = useState<(typeof recommendationMockDevelopers)[number] | null>(null);
  const previewRef = useRef<HTMLDialogElement>(null);
  const options = projects.isSuccess && projects.data.length === 0 ? recommendationMockDeveloperProjects : projects.data ?? [];
  const project = options.find(item => String(item.projectId) === selected) ?? options[0];
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
  const isMock = !!project && (project.projectId < 0 || (developers.isSuccess && !realList.length));
  const { isFetchingNextPage, isFetchNextPageError, fetchNextPage } = developers;
  const hasNextPage = !isMock && developers.hasNextPage;
  useEffect(() => {
    const target = loader.current;
    if (!target || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return;
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) void fetchNextPage(); }, { rootMargin: '200px' });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);
  const requiredSkills = recommendationMockSources.find(item => item.title === project?.title)?.techStacks ?? [];
  const list = isMock ? [...recommendationMockDevelopers].sort((a, b) => b.techStack.filter(stack => requiredSkills.includes(stack.name)).length - a.techStack.filter(stack => requiredSkills.includes(stack.name)).length) : realList;
  return <>
    <RecommendationBasis developer title={project?.title}>{project && <RecommendationMenu label="추천 기준 프로젝트 선택" value={String(project.projectId)} options={options.map(item => ({ value: String(item.projectId), label: item.title }))} onChange={setSelected} />}</RecommendationBasis>
    {isMock && <p className="rec-preview-notice">디자인 미리보기 · 홈 개발자 목데이터입니다. 실제 사용자나 추천 결과가 아닙니다.</p>}
    {!isLoaded ? <RecommendationSkeleton /> : !isSignedIn ? <RecommendationState title="함께할 팀원을 추천받아 보세요" description="로그인하고 내 프로젝트에 맞는 개발자를 만나보세요." to="/login" action="로그인하고 추천 받기" /> : projects.isPending ? <RecommendationSkeleton /> : projects.isError ? <RecommendationState title="내 프로젝트를 불러오지 못했어요" description="잠시 후 다시 시도해 주세요." retry={() => void projects.refetch()} /> : !project ? <RecommendationState title="어떤 프로젝트를 함께 만들까요?" description="프로젝트를 등록하면 필요한 기술과 포지션에 맞는 개발자를 추천해 드려요." to="/project/create" action="프로젝트 등록하기" /> : <>
      <div className="rec-developer-intro"><div><strong>{project.title}</strong><span>프로젝트를 위한 추천 개발자</span></div><span className="rec-order-note">프로젝트 기반 추천순</span></div>
      {!isMock && developers.isPending ? <RecommendationSkeleton /> : developers.isError && !developers.data ? <RecommendationState title="추천 개발자를 불러오지 못했어요" description="연결 상태를 확인한 후 다시 시도해 주세요." retry={() => void developers.refetch()} /> : !list.length ? <RecommendationState title="아직 추천할 개발자가 없어요" description="개발자 탐색에서 다양한 팀원을 직접 찾아보세요." to="/search/developers" action="개발자 탐색하기" /> : <div className="rec-grid rec-developer-grid">{list.map(developer => {
        const bookmark = bookmarks.find(item => item.targetType === 'DEVELOPER' && (item.targetNickname === developer.nickname || (developer.memberId != null && item.targetId === developer.memberId)));
        return <article className="rec-developer-card" key={developer.nickname}><BookmarkButton className="rec-bookmark" aria-label={developer.nickname} bookmarked={isMock ? previewBookmarks.includes(developer.id) : !!bookmark} onBookmarkChange={async next => { if (isMock) { setPreviewBookmarks(current => next ? [...current, developer.id] : current.filter(id => id !== developer.id)); return; } const token = await getToken(); if (!token) throw new Error('로그인이 필요합니다.'); if (next) await createBookmark({ targetType: 'DEVELOPER', targetNickname: developer.nickname }, token); else if (bookmark) await deleteBookmark(bookmark.bookmarkId, token); await client.invalidateQueries({ queryKey: ['bookmarks'] }); }} /><Link to={isMock ? "#" : `/developer-detail/${encodeURIComponent(developer.nickname)}`} onClick={event => { if (isMock) { event.preventDefault(); setPreviewDeveloper(developer); previewRef.current?.showModal(); } }} className="rec-developer-profile"><img src={developer.profileImageUrl || DefaultProfile} alt="" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = DefaultProfile; }} /><h2>{developer.nickname}</h2><span className="rec-role">{developer.role || '개발자'}</span></Link><p className="rec-developer-bio">{developer.introduction || '아직 작성된 소개가 없어요.'}</p><ExploreTechBadges stacks={[...new Set(developer.techStack.map(stack => stack.name))].slice(0, 6)} /><div className="rec-developer-bottom"><p className="rec-reason"><CircleCheck size={15} /><span>{isMock ? requiredSkills.length ? `기술 일치 예시 · ${developer.techStack.filter(stack => requiredSkills.includes(stack.name)).map(stack => stack.name).join(" · ") || "새로운 기술의 팀원을 만나보세요"}` : "프로젝트 추천 디자인 미리보기" : "선택한 프로젝트를 기반으로 추천해요"}</span></p><Link to={isMock ? "#" : `/developer-detail/${encodeURIComponent(developer.nickname)}`} onClick={event => { if (isMock) { event.preventDefault(); setPreviewDeveloper(developer); previewRef.current?.showModal(); } }}>프로필 살펴보기 <ArrowRight size={15} /></Link></div></article>;
      })}</div>}
      <div ref={loader} className="rec-load-more" role="status">{isFetchingNextPage ? '추천 개발자를 더 불러오고 있어요…' : isFetchNextPageError ? <button className="rec-menu-trigger" onClick={() => void fetchNextPage()}>추가 추천 다시 불러오기</button> : !hasNextPage && list.length > 0 ? '추천 개발자를 모두 살펴봤어요.' : null}</div>
    </>}
    <dialog ref={previewRef} className="rec-preview-dialog" aria-label="개발자 목데이터 미리보기"><span className="rec-preview-label">목데이터 미리보기</span><h2>{previewDeveloper?.nickname}</h2><p>{previewDeveloper?.role}<br />{previewDeveloper?.introduction}</p><ExploreTechBadges stacks={previewDeveloper?.techStack.map(stack => stack.name) ?? []} /><button className="rec-primary" onClick={() => previewRef.current?.close()}>닫기</button></dialog>
  </>;
}
