import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { 
  LayoutDashboard, 
  ListChecks, 
  Users, 
  CalendarDays, 
  Settings, 
  LogOut,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/people', label: 'People', icon: Users },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r border-slate-100 p-4">
      <div className="flex items-center gap-2 px-2 mb-8 mt-2">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <span className="text-indigo-600">TaskFlow</span>
        </h1>
        <button className="ml-auto md:hidden text-slate-500">
          <Menu className="size-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              isActive 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-slate-100 mt-4">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 text-left"
        >
          <LogOut className="size-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
