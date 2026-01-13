import { Outlet } from 'react-router-dom';
import Header from '@layouts/header';
import Footer from '@layouts/footer';

const RootLayout = () => {
  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default RootLayout;
