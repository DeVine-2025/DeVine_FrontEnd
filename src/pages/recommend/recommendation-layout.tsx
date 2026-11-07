import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import RecommendationProjects from './recommendation-projects';
import ExploreTabs from '../search/explore-tabs';
import RecommendationDevelopers from './recommendation-developers';
import './recommendation.css';
import './recommendation-explore.css';

export default function RecommendationLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname === '/recommend/project' || pathname === '/recommend/developer') {
      sessionStorage.setItem('recommend-last-tab', pathname);
    }
  }, [pathname]);

  if (pathname === '/recommend' || pathname === '/recommend/') {
    const lastTab = sessionStorage.getItem('recommend-last-tab');
    return <Navigate to={lastTab === '/recommend/developer' ? lastTab : '/recommend/project'} replace />;
  }
  return pathname.endsWith('/developer')
    ? <section className="recommendation-page">
        <header className="explore-title"><h1>추천</h1><p>내 프로젝트에 함께할 개발자를 찾아보세요.</p></header>
        <ExploreTabs mode="recommend" />
        <RecommendationDevelopers />
      </section>
    : <section className="recommendation-page"><header className="explore-title"><h1>추천</h1><p>나에게 맞는 프로젝트를 찾아보세요.</p></header><ExploreTabs mode="recommend" /><RecommendationProjects /></section>;
}
