import React, { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import axios from 'axios';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const API_BASE = 'http://localhost:8000/api';

export default function SidebarCalendar() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_BASE}/events`);
        setEvents(res.data);
      } catch (err) {
        console.error('Failed to fetch events for calendar:', err);
      }
    };
    fetchEvents();
  }, []);

  // Parse event dates and create a map for quick lookup
  const eventDates = [];
  const eventMap = {};
  
  events.forEach(event => {
    // Basic date parsing assuming "MMM DD, YYYY" or "MMM DD" or standard format
    const eventDate = new Date(event.date);
    if (!isNaN(eventDate)) {
      eventDates.push(eventDate);
      eventMap[eventDate.toDateString()] = event;
    }
  });

  const handleDayClick = (day) => {
    const dateStr = day.toDateString();
    if (eventMap[dateStr]) {
      setSelectedEvent(eventMap[dateStr]);
    } else {
      setSelectedEvent(null);
    }
  };

  return (
    <div className="mt-8 border-t border-slate-100 pt-6 px-1">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Calendar</h3>
      
      <style>{`
        .rdp { --rdp-cell-size: 32px; --rdp-accent-color: #4f46e5; margin: 0; }
        .rdp-day_selected { background-color: var(--rdp-accent-color); font-weight: bold; }
        .rdp-day_today { color: var(--rdp-accent-color); font-weight: bold; }
        .rdp-day { font-size: 12px; border-radius: 8px; }
        .event-day { background-color: #e0e7ff; color: #4f46e5; font-weight: bold; border-radius: 8px; }
        .dark .event-day { background-color: #312e81; color: #a5b4fc; }
      `}</style>

      <div className="bg-slate-50 rounded-2xl p-2">
        <DayPicker
          mode="single"
          modifiers={{ hasEvent: eventDates }}
          modifiersClassNames={{ hasEvent: 'event-day' }}
          onDayClick={handleDayClick}
          showOutsideDays
        />
      </div>

      {selectedEvent && (
        <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl animate-in fade-in zoom-in-95">
          <p className="text-xs font-bold text-indigo-900">{selectedEvent.name}</p>
          <p className="text-[10px] text-indigo-600 mt-1">Assigned: {selectedEvent.member_name || 'Unassigned'}</p>
        </div>
      )}
    </div>
  );
}
