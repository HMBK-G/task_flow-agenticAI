import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertCircle, Bell } from 'lucide-react';

const initialNotifications = [
  { id: 1, title: "New Task Assigned", desc: "You have been assigned 'AI Research'", time: "2m ago", icon: <Clock className="size-5 text-indigo-500" />, unread: true },
  { id: 2, title: "Deadline Approaching", desc: "Project Alpha is due in 3 hours", time: "1h ago", icon: <AlertCircle className="size-5 text-amber-500" />, unread: true },
  { id: 3, title: "Task Completed", desc: "Latha finished 'UI Cleanup'", time: "5h ago", icon: <CheckCircle2 className="size-5 text-emerald-500" />, unread: false },
  { id: 4, title: "System Update", desc: "TaskFlow has been updated to v2.0", time: "1d ago", icon: <Bell className="size-5 text-blue-500" />, unread: false },
];

export default function Notifications({ onOpenChat }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    localStorage.setItem('hasUnread', 'false');
    window.dispatchEvent(new Event('notificationsRead'));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Header 
        title="Notifications" 
        subtitle="Stay updated with your club's activity" 
        onOpenChat={onOpenChat} 
      />

      <Card className="border-slate-100 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">All Notifications</h2>
          <button onClick={markAllAsRead} className="text-sm text-indigo-600 font-medium hover:underline">Mark all as read</button>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {notifications.map(n => (
              <div key={n.id} className={`flex gap-4 p-6 hover:bg-slate-50 transition-colors ${n.unread ? 'bg-indigo-50/30' : ''}`}>
                <div className="size-12 rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-sm font-bold truncate ${n.unread ? 'text-slate-900' : 'text-slate-700'}`}>{n.title}</p>
                    <p className="text-xs text-slate-400 whitespace-nowrap ml-4">{n.time}</p>
                  </div>
                  <p className="text-sm text-slate-500">{n.desc}</p>
                </div>
                {n.unread && (
                  <div className="flex items-center">
                    <span className="size-2.5 bg-indigo-600 rounded-full"></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
