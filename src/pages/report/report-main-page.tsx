import { Outlet } from 'react-router-dom';

const ReportMainPage = () => {
  return (
    <div className="flex h-full flex-col">
      <section className="mx-auto flex min-h-0 w-full max-w-[1180px] flex-1 flex-col gap-6">
        <Outlet />
      </section>
    </div>
  );
};

export default ReportMainPage;
