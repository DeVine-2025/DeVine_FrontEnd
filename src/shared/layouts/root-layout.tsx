import { Outlet } from 'react-router-dom';
import Header from '@layouts/header';
import Footer from '@layouts/footer';

const RootLayout = () => {
  return (
    <div className='min-h-[100vh] flex flex-col'>
      <Header />
      <main className='flex-1 px-6 py-8'>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
