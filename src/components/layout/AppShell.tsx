import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export function AppShell() {
  const { matchmaker } = useAuth();
  if (!matchmaker) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-[#f7f5f3]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
