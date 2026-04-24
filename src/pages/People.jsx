import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, Mail, MessageSquare, MoreVertical,
  Pencil, Trash2, Check, X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Header from '@/components/Header';
import axios from 'axios';
import AddMemberModal from '@/components/AddMemberModal';

const API_BASE = 'http://localhost:8000/api';

export default function People({ onOpenChat }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchMembersRef = React.useRef(null);

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/members`);
      setMembers(res.data);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchMembersRef.current = fetchMembers;

  useEffect(() => {
    fetchMembers();
    const handler = () => fetchMembersRef.current();
    window.addEventListener('refresh_data', handler);
    return () => window.removeEventListener('refresh_data', handler);
  }, []);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-slate-500">Loading members...</div>;

  const handleExport = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tasks`);
      const tasks = res.data;
      
      const headers = ['Task ID', 'Member Name', 'Task Title', 'Description', 'Status', 'Deadline', 'Priority', 'Category'];
      const csvContent = [
        headers.join(','),
        ...tasks.map(t => [
          t.id, 
          `"${t.member_name || ''}"`, 
          `"${(t.title || '').replace(/"/g, '""')}"`, 
          `"${(t.description || '').replace(/"/g, '""')}"`, 
          `"${t.status || ''}"`, 
          `"${t.deadline || ''}"`, 
          `"${t.priority || ''}"`, 
          `"${t.category || ''}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'taskflow_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to export list');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Header 
        title="People" 
        subtitle="Manage your club members and their roles" 
        onOpenChat={onOpenChat} 
      />
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="border-slate-200" onClick={handleExport}>Export List</Button>
        <AddMemberModal onMemberAdded={fetchMembers} />
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input 
            placeholder="Search by name, role or skill..." 
            className="pl-10 border-none bg-transparent focus-visible:ring-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMembers.map(member => (
          <MemberCard key={member.id} member={member} onRefresh={fetchMembers} />
        ))}
      </div>
    </div>
  );
}

function MemberCard({ member, onRefresh }) {
  const [showEmail, setShowEmail] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(member.name);
  const [editRole, setEditRole] = useState(member.role);
  const [editEmail, setEditEmail] = useState(member.email || '');
  const [editPhone, setEditPhone] = useState(member.phone || '');

  const handleDelete = async () => {
    if (!window.confirm(`Remove ${member.name} from the club?`)) return;
    try {
      await axios.delete(`${API_BASE}/members/${member.id}`);
      onRefresh();
    } catch (err) {
      alert('Failed to delete member');
    }
  };

  const handleEdit = async () => {
    try {
      await axios.put(`${API_BASE}/members/${member.id}`, { name: editName, role: editRole, email: editEmail, phone: editPhone });
      setIsEditing(false);
      onRefresh();
    } catch (err) {
      alert('Failed to update member');
    }
  };

  return (
    <Card className="border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 ring-4 ring-slate-50 ring-offset-0 transition-all duration-300 group-hover:ring-indigo-100">
              <AvatarFallback className="text-xl font-bold text-indigo-600 bg-indigo-50">
                {member.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              {isEditing ? (
                <div className="space-y-1">
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="h-7 text-sm font-bold border-indigo-300 focus-visible:ring-indigo-500"
                    placeholder="Name"
                  />
                  <Input
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    className="h-6 text-xs border-indigo-200 focus-visible:ring-indigo-400"
                    placeholder="Role"
                  />
                  <Input
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="h-6 text-xs border-indigo-200 focus-visible:ring-indigo-400"
                    placeholder="Email"
                  />
                  <Input
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="h-6 text-xs border-indigo-200 focus-visible:ring-indigo-400"
                    placeholder="Phone"
                  />
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                  <p className="text-sm font-medium text-indigo-600">{member.role}</p>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="size-8 text-emerald-600 hover:bg-emerald-50" onClick={handleEdit}>
                <Check className="size-4" />
              </Button>
              <Button size="icon" variant="ghost" className="size-8 text-red-400 hover:bg-red-50" onClick={() => setIsEditing(false)}>
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                  <MoreVertical className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-100 shadow-xl">
                <DropdownMenuItem 
                  className="cursor-pointer gap-2 hover:bg-slate-50 rounded-lg py-2"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="size-4 text-indigo-500" /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer gap-2 hover:bg-red-50 text-red-600 rounded-lg py-2"
                  onClick={handleDelete}
                >
                  <Trash2 className="size-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 p-3 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Tasks Done</p>
            <p className="text-xl font-bold text-slate-800">{member.tasks_count}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Total</p>
            <p className="text-xl font-bold text-slate-800">{member.tasks_total}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 h-10 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
            onClick={() => setShowEmail(!showEmail)}
          >
            {showEmail ? (
              <span className="text-xs truncate px-1">{member.email}</span>
            ) : (
              <><Mail className="size-4 mr-2" /> Show Email</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
