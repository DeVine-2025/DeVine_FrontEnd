import Footer from '@layouts/footer';
import Header from '@layouts/header';
import { Outlet } from 'react-router-dom';

const RootLayout = () => {
  return (
    <div className="flex min-h-[100vh] flex-col">
      <Header />
      <main className="flex-1 py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
