import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Loader2, Plus } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export default function AddEventModal({ onEventAdded }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    member_name: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API_BASE}/events`, formData);
      setOpen(false);
      if (onEventAdded) onEventAdded();
      setFormData({ name: '', date: '', member_name: '' });
    } catch (err) {
      alert("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 font-medium">
          <Plus className="size-4 mr-2" /> Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl p-6 border-slate-100 shadow-2xl">
        <DialogHeader className="mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <CalendarIcon className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">Create New Event</DialogTitle>
              <p className="text-sm text-slate-500 mt-1">Add a new event to the club calendar.</p>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-slate-700 text-xs uppercase font-bold tracking-wider">Event Name</Label>
            <Input 
              required 
              placeholder="e.g. Hackathon Kickoff"
              className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-600 transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 text-xs uppercase font-bold tracking-wider">Date</Label>
            <Input 
              required 
              type="date"
              className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-600 transition-all"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 text-xs uppercase font-bold tracking-wider">Assigned Member (Optional)</Label>
            <Input 
              placeholder="e.g. Latha"
              className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-600 transition-all"
              value={formData.member_name}
              onChange={e => setFormData({...formData, member_name: e.target.value})}
            />
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-base font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all duration-200" 
              disabled={loading}
            >
              {loading ? <Loader2 className="size-5 animate-spin mr-2" /> : <Plus className="size-5 mr-2" />}
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
