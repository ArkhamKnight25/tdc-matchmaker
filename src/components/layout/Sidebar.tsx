import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profiles', icon: Users, label: 'Pool Profiles' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { matchmaker, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-stone-100 flex flex-col min-h-screen">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-stone-100">
        <div className="w-8 h-8 rounded-lg bg-[#9b1c5a] flex items-center justify-center">
          <Heart className="w-4 h-4 text-white fill-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-stone-800 leading-none">TDC</div>
          <div className="text-[10px] text-stone-400 leading-none mt-0.5">Matchmaker</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors',
                isActive
                  ? 'bg-[#f9e5ee] text-[#9b1c5a]'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-stone-100 p-4">
        {matchmaker && (
          <div className="flex items-center gap-2.5 mb-3">
            <Avatar name={matchmaker.name} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-stone-800 truncate">{matchmaker.name}</div>
              <div className="text-[10px] text-stone-400 truncate">{matchmaker.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full text-sm text-stone-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
