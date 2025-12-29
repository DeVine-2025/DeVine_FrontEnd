import { Outlet } from 'react-router-dom';
import Header from '@layouts/header';

const RootLayout = () => {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
};

export default RootLayout;
