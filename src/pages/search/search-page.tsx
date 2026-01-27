import SearchTabs from '@components/search/SearchTabs';
import { Outlet } from 'react-router-dom';

export default function SearchPage() {
  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
      <SearchTabs />

      <div>
        <Outlet />
      </div>
    </section>
  );
}
