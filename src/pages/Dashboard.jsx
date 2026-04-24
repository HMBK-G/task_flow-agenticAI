import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ClipboardList, 
  Clock, 
  AlertTriangle, 
  Users, 
  Calendar,
  MoreHorizontal,
  Bot
} from 'lucide-react';
import Header from '@/components/Header';
import AddTaskModal from '@/components/AddTaskModal';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API_BASE = 'http://localhost:8000/api';

export default function Dashboard({ onOpenChat }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE}/dashboard`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    window.addEventListener('refresh_data', fetchData);
    return () => window.removeEventListener('refresh_data', fetchData);
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Loading dashboard...</div>;
  if (!data) return <div className="p-8 text-red-500">Error loading data. Make sure the backend is running.</div>;

  const { stats, recent_tasks, member_activity, upcoming_events } = data;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Header 
        title="Dashboard" 
        subtitle="Club workflow overview — AI-powered management" 
        onOpenChat={onOpenChat} 
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Tasks" value={stats.total_tasks} icon={ClipboardList} color="text-indigo-600" bg="bg-indigo-50" hint={`${stats.completed_tasks} done`} />
        <StatCard label="In Progress" value={stats.in_progress} icon={Clock} color="text-blue-600" bg="bg-blue-50" hint="Active" />
        <StatCard label="Urgent" value={stats.urgent} icon={AlertTriangle} color="text-red-600" bg="bg-red-50" hint="Priority High" />
        <StatCard label="Members" value={stats.members_count} icon={Users} color="text-emerald-600" bg="bg-emerald-50" hint="In team" />
        <StatCard label="Events" value={stats.events_count} icon={Calendar} color="text-purple-600" bg="bg-purple-50" hint="Upcoming" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
              Recent Tasks
            </h2>
            <Link to="/tasks" className="text-sm text-indigo-600 font-medium hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recent_tasks.map(task => (
              <TaskCard key={task.id} task={task} onUpdate={() => axios.get(`${API_BASE}/dashboard`).then(res => setData(res.data))} />
            ))}
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-8">
          {/* Member Activity */}
          <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Users className="size-5 text-indigo-600" />
              Member Activity
            </h2>
            <div className="space-y-6">
              {member_activity.map(member => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 bg-slate-100">
                      <AvatarFallback className="text-indigo-600 font-bold">{member.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold text-slate-700">{member.name}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{member.tasks_count}/{member.tasks_total}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming Events */}
          <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="size-5 text-indigo-600" />
                Upcoming Events
              </h2>
              <Link to="/events" className="text-xs text-indigo-600 font-medium">All</Link>
            </div>
            <div className="space-y-4">
              {upcoming_events.map(event => (
                <div key={event.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                  <div className="size-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                    <Calendar className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{event.name}</p>
                    <p className="text-xs text-slate-500">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, hint }) {
  return (
    <Card className="border-none shadow-sm overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className={cn("p-2 rounded-xl transition-colors duration-300", bg)}>
            <Icon className={cn("size-5", color)} />
          </div>
        </div>
        <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
        <p className="text-xs text-slate-400">{hint}</p>
      </CardContent>
    </Card>
  );
}

function TaskCard({ task, onUpdate }) {
  const handleComplete = async () => {
    try {
      const newStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
      await axios.put(`${API_BASE}/tasks/${task.id}`, { status: newStatus });
      if (onUpdate) onUpdate();
    } catch (e) {
      alert("Failed to update task");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/tasks/${task.id}`);
      if (onUpdate) onUpdate();
    } catch (e) {
      alert("Failed to delete task");
    }
  };

  return (
    <Card className="border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <CardHeader className="p-5 pb-0 flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {task.status === 'Completed' ? <span className="line-through text-slate-400">{task.title}</span> : task.title}
          </CardTitle>
          {task.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{task.description}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-slate-400 hover:text-slate-900 p-1 rounded-md hover:bg-slate-50 transition-colors">
              <MoreHorizontal className="size-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-100 shadow-xl">
            <DropdownMenuItem onClick={handleComplete} className="cursor-pointer hover:bg-slate-50 rounded-lg py-2">
              {task.status === 'Completed' ? 'Mark Incomplete' : 'Mark Complete'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="cursor-pointer hover:bg-red-50 text-red-600 rounded-lg py-2">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 font-medium px-3 py-0.5 rounded-full">
            {task.priority}
          </Badge>
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-medium px-3 py-0.5 rounded-full">
            {task.status}
          </Badge>
          {task.category && (
            <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 font-medium px-3 py-0.5 rounded-full italic">
              {task.category}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <Avatar className="size-6 bg-indigo-50">
              <AvatarFallback className="text-[10px] text-indigo-600 font-bold">
                {task.member_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-[11px] font-medium text-slate-500">{task.member_name}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Calendar className="size-3" />
            <span className="text-[10px] font-medium">{task.deadline}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
