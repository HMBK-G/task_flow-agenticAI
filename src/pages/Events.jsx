import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export default function Events({ onOpenChat }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  useEffect(() => {
    fetchEvents();
    window.addEventListener('refresh_data', fetchEvents);
    return () => window.removeEventListener('refresh_data', fetchEvents);
  }, []);

  const filteredEvents = events.filter(e => 
    e.title?.toLowerCase().includes(search.toLowerCase()) || 
    e.member_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500">
      <Header 
        title="Events" 
        subtitle="Manage assigned events across your team" 
        onOpenChat={onOpenChat} 
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input 
            placeholder="Search events or members..." 
            className="pl-10 border-none bg-transparent focus-visible:ring-0 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-slate-500 p-8 text-center">Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-slate-500 p-8 text-center bg-white rounded-2xl border border-slate-100">No events found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Passed': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <Card className="border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4 gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={`border ${getStatusColor(event.status)} shadow-none`}>
              {event.status}
            </Badge>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
          {event.title}
        </h3>
        
        <p className="text-sm text-slate-500 mb-6 line-clamp-3 flex-1 leading-relaxed">
          {event.description}
        </p>
        
        <div className="mt-auto space-y-4 pt-4 border-t border-slate-50">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="size-4 text-indigo-500" />
              <span className="font-medium text-slate-700">{event.date}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                {event.member_name ? event.member_name[0].toUpperCase() : '?'}
              </div>
              <p className="text-sm font-bold text-slate-700">{event.member_name}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
