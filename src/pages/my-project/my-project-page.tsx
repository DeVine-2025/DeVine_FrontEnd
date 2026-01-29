import MyProjectTabs from '@components/tab/MyProjectTabs';
import { Outlet } from 'react-router-dom';

export default function MyProjectPage() {
  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
      <MyProjectTabs />

      <div>
        <Outlet />
      </div>
    </section>
  );
}
