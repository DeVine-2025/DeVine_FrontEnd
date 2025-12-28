import { applyTheme, getTheme } from '@store/theme';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

const RootLayout = () => {
  // 라이트/다크 모드 초기 설정
  useEffect(() => {
    applyTheme(getTheme());
  }, []);

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default RootLayout;
