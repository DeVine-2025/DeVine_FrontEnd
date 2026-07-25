import { Outlet } from 'react-router-dom';
import '../styles/admin.css';

export function AdminApp() {
  return (
    <div className="admin-app">
      <Outlet />
    </div>
  );
}
