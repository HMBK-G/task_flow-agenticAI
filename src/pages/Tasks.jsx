import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ClipboardList,
  Users,
  Pencil,
  Trash2,
  Check,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import AddTaskModal from '@/components/AddTaskModal';
import axios from 'axios';
import { cn } from '@/lib/utils';

const API_BASE = 'http://localhost:8000/api';

export default function Tasks({ onOpenChat }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasksRef = React.useRef(null);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tasks`);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchTasksRef.current = fetchTasks;

  useEffect(() => {
    fetchTasks();
    const handler = () => fetchTasksRef.current();
    window.addEventListener('refresh_data', handler);
    return () => window.removeEventListener('refresh_data', handler);
  }, []);

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.member_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-slate-500">Loading tasks...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <Header 
        title="Tasks" 
        subtitle="Manage and track your club's workflow" 
        onOpenChat={onOpenChat} 
      />
      
      <div className="flex justify-end">
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
        >
          <Plus className="size-4 mr-2" /> Add New Task
        </Button>
      </div>

      <AddTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTaskAdded={fetchTasks} 
      />

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input 
            placeholder="Search tasks or assignees..." 
            className="pl-10 border-none bg-transparent focus-visible:ring-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="sm" className="text-slate-500">
          <Filter className="size-4 mr-2" /> Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <ClipboardList className="size-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500">No tasks found matching your search.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskListItem key={task.id} task={task} onRefresh={fetchTasks} />
          ))
        )}
      </div>
    </div>
  );
}

function TaskListItem({ task, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState(task.priority);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API_BASE}/tasks/${task.id}`);
        onRefresh();
      } catch (err) {
        alert('Failed to delete task');
      }
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const newStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
      await axios.put(`${API_BASE}/tasks/${task.id}`, { status: newStatus });
      onRefresh();
    } catch (e) {
      alert('Failed to update task');
    }
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`${API_BASE}/tasks/${task.id}`, { title: editTitle, priority: editPriority });
      setIsEditing(false);
      onRefresh();
    } catch (e) {
      alert('Failed to save task');
    }
  };

  const statusIcons = {
    "To Do": <Clock className="size-4" />,
    "In Progress": <Clock className="size-4" />,
    "Completed": <CheckCircle2 className="size-4" />
  };

  const priorityColors = {
    "High": "bg-red-50 text-red-700 border-red-100",
    "Medium": "bg-amber-50 text-amber-700 border-amber-100",
    "Low": "bg-emerald-50 text-emerald-700 border-emerald-100"
  };

  return (
    <Card className="border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center p-4 md:p-6 gap-4 md:gap-6">
          <button 
            onClick={handleUpdateStatus}
            className={cn(
              "size-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
              task.status === "Completed" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
            )}
          >
            {statusIcons[task.status] || <AlertCircle className="size-5" />}
          </button>
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input 
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="h-9 text-sm font-bold border-indigo-200 focus-visible:ring-indigo-500"
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Select value={editPriority} onValueChange={setEditPriority}>
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1 ml-auto">
                    <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700" onClick={handleEditSave}>
                      <Check className="size-4 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-slate-500" onClick={() => setIsEditing(false)}>
                      <X className="size-4 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn(
                  "text-base font-bold truncate transition-colors",
                  task.status === "Completed" ? "text-slate-400 line-through" : "text-slate-900"
                )}>
                  {task.title}
                </h3>
                <Badge variant="outline" className={cn("text-[10px] px-2 py-0 rounded-full", priorityColors[task.priority])}>
                  {task.priority}
                </Badge>
              </div>
            )}
            {!isEditing && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="size-3" /> {task.member_name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" /> Due {task.deadline}
                </span>
                {task.category && (
                  <span className="px-2 py-0.5 bg-slate-50 rounded text-slate-400 font-medium italic">
                    #{task.category}
                  </span>
                )}
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                    <MoreVertical className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-100 shadow-xl">
                  <DropdownMenuItem onClick={handleUpdateStatus} className="cursor-pointer gap-2 hover:bg-slate-50 rounded-lg py-2">
                    {task.status === 'Completed' ? 'Mark Incomplete' : 'Mark Complete'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer gap-2 hover:bg-slate-50 rounded-lg py-2">
                    <Pencil className="size-4 text-indigo-500" /> Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="cursor-pointer gap-2 hover:bg-red-50 text-red-600 rounded-lg py-2">
                    <Trash2 className="size-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
