import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Send, Loader2, UserPlus } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';

const API_BASE = 'http://localhost:8000/api';

export default function EventCreation() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    member_name: '',
    email: '',
    phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email && !formData.phone) {
      toast({ title: "Email or Phone is required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/assign-event`, formData);
      toast({ title: "Event assigned successfully!" });
      setFormData({
        title: '',
        description: '',
        date: '',
        member_name: '',
        email: '',
        phone: ''
      });
    } catch (err) {
      console.error("Assign Event Error:", err);
      toast({ 
        title: "Failed to assign event", 
        description: err.response?.data?.detail || err.message || "Unknown error",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Create New Event</h1>
        <p className="text-slate-500 mt-2">Assign events to members dynamically.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CalendarDays className="size-5 text-indigo-600" /> Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Event Title</Label>
              <Input 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Annual Hackathon"
                className="rounded-xl h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                required
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the event details..."
                className="rounded-xl min-h-[100px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Event Date</Label>
              <Input 
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
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
          Assign Event
        </Button>
      </form>
    </div>
  );
}
