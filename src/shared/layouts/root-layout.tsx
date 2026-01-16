import Footer from '@layouts/footer';
import Header from '@layouts/header';
import { Outlet } from 'react-router-dom';

const RootLayout = () => {
  return (
    <div className="flex min-h-[100vh] flex-col">
      <Header />
      <main className="flex-1 px-6 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
