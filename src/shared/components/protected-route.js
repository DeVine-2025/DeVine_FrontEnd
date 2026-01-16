import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
const ProtectedRoute = ({ children }) => {
    // TODO: 초기 개발 단계이므로 토큰 체크 없이 항상 통과
    // 나중에 토큰 체크 로직 추가 예정
    // const token = localStorage.getItem('token');
    // if (!token) {
    //   return <Navigate to="/login" replace />;
    // }
    // 레이아웃 라우트로 사용될 때는 Outlet을 렌더링
    // children이 있으면 기존 방식대로 children을 렌더링 (하위 호환성)
    return children ? _jsx(_Fragment, { children: children }) : _jsx(Outlet, {});
};
export default ProtectedRoute;
