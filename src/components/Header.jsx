import React from 'react';
import { Bot, Bell, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const notifications = [
  { id: 1, title: "New Task Assigned", desc: "You have been assigned 'AI Research'", time: "2m ago", icon: <Clock className="size-4 text-indigo-500" /> },
  { id: 2, title: "Deadline Approaching", desc: "Project Alpha is due in 3 hours", time: "1h ago", icon: <AlertCircle className="size-4 text-amber-500" /> },
  { id: 3, title: "Task Completed", desc: "Latha finished 'UI Cleanup'", time: "5h ago", icon: <CheckCircle2 className="size-4 text-emerald-500" /> },
];

export default function Header({ title, subtitle, onOpenChat }) {
  const { user } = useAuth();
  const [hasUnread, setHasUnread] = React.useState(() => localStorage.getItem('hasUnread') !== 'false');

  React.useEffect(() => {
    const handleRead = () => setHasUnread(false);
    window.addEventListener('notificationsRead', handleRead);
    return () => window.removeEventListener('notificationsRead', handleRead);
  }, []);

  return (
    <header className="flex justify-between items-start mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="relative cursor-pointer">
              {hasUnread && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
              <button className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all duration-200">
                <span className="sr-only">Notifications</span>
                <Bell className="size-5 text-slate-600" />
              </button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2 rounded-2xl border-slate-100 shadow-2xl">
            <DropdownMenuLabel className="px-3 py-2 text-sm font-bold text-slate-900 flex justify-between items-center">
              Notifications
              <span className="text-[10px] font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">3 New</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-50" />
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.map(n => (
                <DropdownMenuItem key={n.id} className="p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors focus:bg-slate-50 border-none outline-none">
                  <div className="flex gap-3">
                    <div className="size-9 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                      {n.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{n.desc}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator className="bg-slate-50" />
            <DropdownMenuItem asChild className="p-2 text-center text-[11px] font-bold text-indigo-600 justify-center hover:bg-indigo-50 rounded-lg cursor-pointer">
              <Link to="/notifications">View All Notifications</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-slate-500">{user?.role || 'Administrator'}</p>
          </div>
          <button 
            onClick={onOpenChat}
            className="size-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Bot className="size-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
