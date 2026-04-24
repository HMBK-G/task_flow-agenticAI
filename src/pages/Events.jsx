import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Plus, 
  Search,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import axios from 'axios';
import AddEventModal from '@/components/AddEventModal';

const API_BASE = 'http://localhost:8000/api';

export default function Events({ onOpenChat }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_BASE}/events`);
        setEvents(res.data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();

    window.addEventListener('refresh_data', fetchEvents);
    return () => window.removeEventListener('refresh_data', fetchEvents);
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Loading events...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500">
      <Header 
        title="Events" 
        subtitle="Upcoming club meetups and AI workshops" 
        onOpenChat={onOpenChat} 
      />
      
      <div className="flex justify-end">
        <AddEventModal onEventAdded={() => {
          axios.get(`${API_BASE}/events`).then(res => setEvents(res.data));
        }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <Card key={event.id} className="border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="p-6">
              <div className="flex justify-between items-start">
                <div className="size-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                  <Calendar className="size-6" />
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400">
                  <MoreVertical className="size-5" />
                </Button>
              </div>
              <CardTitle className="text-xl font-bold text-slate-900">{event.name}</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="size-4 text-indigo-500" /> {event.date}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="size-4 text-indigo-500" /> Club HQ / Online
                </div>
              </div>
              <Button className="w-full bg-slate-50 text-slate-600 hover:bg-slate-100 border-none shadow-none">
                <ExternalLink className="size-4 mr-2" /> View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
