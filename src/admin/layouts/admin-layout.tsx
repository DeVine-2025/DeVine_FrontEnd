import { Outlet } from 'react-router-dom';
import { AdminHeader } from './admin-header';

export function AdminLayout() {
  return (
    <div>
      <AdminHeader />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
