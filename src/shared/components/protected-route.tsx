import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // TODO: 초기 개발 단계이므로 토큰 체크 없이 항상 통과
  // 나중에 토큰 체크 로직 추가 예정
  // const token = localStorage.getItem('token');
  // if (!token) {
  //   return <Navigate to="/login" replace />;
  // }

  return <>{children}</>;
};

export default ProtectedRoute;

