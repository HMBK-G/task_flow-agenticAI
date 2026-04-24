import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Send, Loader2, UserPlus } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';

const API_BASE = 'http://localhost:8000/api';

export default function TaskCreation() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    member_name: '',
    email: '',
    phone: ''
  });

  const handleAiSuggest = async () => {
    if (!formData.title) {
      toast({ title: "Please enter a title first", variant: "destructive" });
      return;
    }
    setAiLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/ai/suggest`, {
        title: formData.title,
        description: formData.description
      });
      const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
      
      setFormData(prev => ({
        ...prev,
        description: data.expanded_description || prev.description
      }));
      
      toast({
        title: "AI Suggestions Applied",
        description: `Suggested Priority: ${data.priority}`,
      });
    } catch (err) {
      toast({ title: "AI suggestion failed", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email && !formData.phone) {
      toast({ title: "Email or Phone is required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/assign-task`, formData);
      toast({ title: "Task assigned successfully!" });
      setFormData({
        title: '',
        description: '',
        deadline: '',
        member_name: '',
        email: '',
        phone: ''
      });
    } catch (err) {
      toast({ title: "Failed to assign task", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Create New Task</h1>
        <p className="text-slate-500 mt-2">Assign tasks and members dynamically in one step.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="size-5 text-indigo-600" /> Task Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Task Title</Label>
              <Input 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Design Club Logo"
                className="rounded-xl h-11"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Description</Label>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  onClick={handleAiSuggest}
                  disabled={aiLoading}
                  className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-8 gap-1.5"
                >
                  {aiLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                  AI Suggest
                </Button>
              </div>
              <Textarea 
                required
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the task expectations..."
                className="rounded-xl min-h-[100px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input 
                required
                type="date"
                value={formData.deadline}
                onChange={e => setFormData({...formData, deadline: e.target.value})}
                className="rounded-xl h-11"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <UserPlus className="size-5 text-emerald-600" /> Assign Member
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Member Name</Label>
              <Input 
                required
                value={formData.member_name}
                onChange={e => setFormData({...formData, member_name: e.target.value})}
                placeholder="Full name of the assignee"
                className="rounded-xl h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="+1234567890"
                  className="rounded-xl h-11"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic">* At least one contact method is required.</p>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-lg font-bold rounded-xl shadow-lg shadow-indigo-100"
        >
          {loading ? <Loader2 className="size-5 animate-spin mr-2" /> : <Send className="size-5 mr-2" />}
          Assign Task
        </Button>
      </form>
    </div>
  );
}
