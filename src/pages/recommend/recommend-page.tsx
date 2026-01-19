import { Navigate, Outlet, useLocation } from 'react-router-dom';

const RecommendPage = () => {
  const location = useLocation();

  // /recommend로 직접 접근하면 /recommend/project로 리다이렉트
  if (location.pathname === '/recommend') {
    return <Navigate to="/recommend/project" replace />;
  }

  return <Outlet />;
};

export default RecommendPage;

