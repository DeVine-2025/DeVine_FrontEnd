import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useElasticUnderline } from '@hooks/useElasticUnderline';
import { Helmet } from 'react-helmet-async';
import '../search/explore-tabs.css';
import './recommendation.css';

export default function RecommendationLayout() {
  const { pathname } = useLocation();
  const { navRef, indicatorRef } = useElasticUnderline(pathname);
  const developer = pathname.endsWith('/developer');
  return <section className="recommendation-page">
    <Helmet><title>{developer ? '개발자 추천' : '프로젝트 추천'} | DeVine</title></Helmet>
    <nav ref={navRef} className="explore-tabs" aria-label="추천 대상">
      <NavLink to="/recommend/project" className={({ isActive }) => isActive ? 'is-active' : undefined}>프로젝트</NavLink>
      <NavLink to="/recommend/developer" className={({ isActive }) => isActive ? 'is-active' : undefined}>개발자</NavLink>
      <span ref={indicatorRef} className="explore-tabs-indicator" aria-hidden="true" />
    </nav>
    <header className="recommendation-heading"><h1>{developer ? '우리 프로젝트에 맞는 개발자' : '나에게 맞는 프로젝트'}</h1><p>{developer ? '프로젝트에 필요한 기술과 포지션을 기준으로 팀원을 찾아보세요.' : 'GitHub 분석 리포트를 바탕으로 함께할 프로젝트를 추천해요.'}</p></header>
    <Outlet />
  </section>;
}
