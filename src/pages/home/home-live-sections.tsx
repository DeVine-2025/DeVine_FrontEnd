import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { getProjects } from '@apis/projects';
import { getWeeklyBestProjects } from '@apis/project-detail';
import { getRecommendProjects } from '@apis/recommend';
import { getRecommendDevelopersPreview } from '@apis/members';
import { useBookmarks, useChangeBookmark } from '@hooks/useBookmarks';
import { useMyRecruitingProjects } from '@hooks/useMyRecruitingProjects';
import ProjectCard from '@components/cards/ProjectCard';
import DeveloperCard from '@components/cards/DeveloperCard';
import DefaultImage from '@assets/images/devine-symbol.png';
import { DOMAIN_OPTIONS, type Domain } from '@constants/domain';
import type { ProjectItem } from '@t/project/api';
import { mapApiProject } from '../search/project/project-explore-page';
import RecommendedProjectApiCard from '../recommend/RecommendedProjectApiCard';

export default function HomeLiveSections({ isDeveloper }: { isDeveloper: boolean }) {
  const { isSignedIn, getToken, userId } = useAuth();
  const navigate = useNavigate();
  const saveBookmark = useChangeBookmark();
  const { data: bookmarks = [] } = useBookmarks({ enabled: !!isSignedIn });
  const myProjects = useMyRecruitingProjects();
  const latest = useQuery({ queryKey: ['home-latest-projects'], queryFn: async ({ signal }) => getProjects({ page: 1, size: 4 }, (await getToken()) ?? undefined, signal) });
  const weekly = useQuery({ queryKey: ['home-weekly-projects'], queryFn: getWeeklyBestProjects });
  const recommendations = useQuery({ queryKey: ['home-project-recommendations', userId], enabled: !!isSignedIn && isDeveloper, queryFn: async ({ signal }) => { const token = await getToken(); if (!token) throw new Error('로그인이 필요합니다.'); return getRecommendProjects(token, '', signal); } });
  const projectId = myProjects.data?.[0]?.projectId;
  const developers = useQuery({ queryKey: ['home-developer-recommendations', userId, projectId], enabled: !!isSignedIn && !isDeveloper && !!projectId, queryFn: async () => { const token = await getToken(); if (!token || !projectId) throw new Error('프로젝트를 확인해 주세요.'); return getRecommendDevelopersPreview(4, token, projectId); } });
  const changeBookmark = async (type: 'PROJECT' | 'DEVELOPER', id: string, next: boolean) => {
    const token = await getToken();
    if (!token) { navigate('/login'); return; }
    const bookmark = bookmarks.find(item => item.targetType === type && (type === 'PROJECT' ? item.targetId === Number(id) : item.targetNickname === id));
    try {
      const target = type === 'PROJECT'
        ? { targetType: type, targetId: Number(id) }
        : { targetType: type, targetNickname: id };
      await saveBookmark(target, next, bookmark?.bookmarkId, token);
    } catch { alert('북마크를 변경하지 못했어요. 다시 시도해 주세요.'); }
  };
  const heading = (title: string, to: string) => <div className="home-section-heading mb-[var(--home-space-heading)] flex items-start justify-between gap-[16px] home-section-heading-accent"><div><h2>{title}</h2></div><Link to={to}>전체보기 →</Link></div>;
  return <>
    <section className="home-section home-section-featured" aria-label="주목받는 프로젝트">
      {heading('지금 주목받는 프로젝트', '/search/projects')}
      {weekly.isPending ? <p>프로젝트를 불러오고 있어요.</p> : weekly.isError ? <p>프로젝트를 불러오지 못했어요. <button onClick={() => void weekly.refetch()}>다시 시도</button></p> : <div className="home-featured-grid explore-projects-grid">{weekly.data.slice(0, 3).map(item => <ProjectCard key={item.projectId} project={{ id: String(item.projectId), title: item.title, thumbnail: item.thumbnailUrl || DefaultImage, domain: DOMAIN_OPTIONS.find(domain => domain === item.categoryName) as Domain | undefined ?? null, memberCount: { current: item.positions.reduce((n, p) => n + p.currentCount, 0), total: item.positions.reduce((n, p) => n + p.count, 0) }, deadline: { remaining: item.daysUntilDeadline ?? null, date: '' }, status: null, description: '', techStacks: [], duration: item.durationRangeName ?? (item.durationMonths ? `${item.durationMonths}개월` : ''), workMode: item.modeName ?? '' }} saved={bookmarks.some(b => b.targetType === 'PROJECT' && b.targetId === item.projectId)} variant="grid" showProfiles showTechStacks={false} onOpen={() => navigate(`/project/${item.projectId}`)} onBookmarkChange={next => void changeBookmark('PROJECT', String(item.projectId), next)} />)}</div>}
    </section>
    <section className="home-section home-section-personalized">
      {heading(isDeveloper ? '나에게 딱 맞는 추천 프로젝트' : '나에게 딱 맞는 추천 개발자', isDeveloper ? '/recommend/project' : '/recommend/developer')}
      {!isSignedIn ? <p>로그인하면 맞춤 추천을 확인할 수 있어요.</p> : isDeveloper ? recommendations.isPending ? <p>추천을 불러오고 있어요.</p> : recommendations.isError ? <p>추천을 불러오지 못했어요. <button onClick={() => void recommendations.refetch()}>다시 시도</button></p> : <div className="home-developers-grid home-recommended-projects">{recommendations.data.list.slice(0, 4).map(item => <RecommendedProjectApiCard key={item.id} project={item} variant="grid" saved={bookmarks.some(b => b.targetType === 'PROJECT' && b.targetId === Number(item.id))} onBookmark={next => changeBookmark('PROJECT', item.id, next)} />)}</div> : developers.isPending && !!projectId ? <p>추천을 불러오고 있어요.</p> : developers.isError ? <p>추천을 불러오지 못했어요. <button onClick={() => void developers.refetch()}>다시 시도</button></p> : <div className="home-developers-grid home-developer-card-grid">{developers.data?.map(item => <DeveloperCard key={item.nickname} developer={{ member: { nickname: item.nickname, address: null, disclosure: true, mainType: 'DEVELOPER', imageUrl: item.image, body: item.body, used: '', createdAt: '' }, domains: item.domains ?? [], techstacks: item.techstacks.map((name, index) => ({ techstackId: index, name, genre: 'skill', source: 'MANUAL' })) }} variant="grid" showConditions={false} showTechStacks={false} bookmarked={bookmarks.some(b => b.targetType === 'DEVELOPER' && b.targetNickname === item.nickname)} pending={false} onBookmarkChange={next => changeBookmark('DEVELOPER', item.nickname, next)} />)}</div>}
      {isSignedIn && !isDeveloper && !projectId && !myProjects.isPending && <p>프로젝트를 등록하면 개발자를 추천받을 수 있어요.</p>}
    </section>
    <section className="home-section home-section-recent" aria-label="새 프로젝트">
      {heading('새롭게 올라온 프로젝트', '/search/projects')}
      {latest.isPending ? <p>프로젝트를 불러오고 있어요.</p> : latest.isError ? <p>프로젝트를 불러오지 못했어요. <button onClick={() => void latest.refetch()}>다시 시도</button></p> : <div className="home-recent-grid explore-projects-list">{(latest.data.content as ProjectItem[]).map(item => <ProjectCard key={item.projectId} project={mapApiProject(item)} saved={bookmarks.some(b => b.targetType === 'PROJECT' && b.targetId === item.projectId)} variant="list" wideImage showTechStacks={false} onOpen={() => navigate(`/project/${item.projectId}`)} onBookmarkChange={next => void changeBookmark('PROJECT', String(item.projectId), next)} />)}</div>}
    </section>
  </>;
}
