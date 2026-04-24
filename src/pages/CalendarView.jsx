import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export default function CalendarView({ onOpenChat }) {
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

  const eventDates = [];
  const eventMap = {};
  
  events.forEach(event => {
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
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500">
      <Header 
        title="Calendar" 
        subtitle="View and manage club events by date" 
        onOpenChat={onOpenChat} 
      />
      
      <style>{`
        .calendar-large .rdp {
          --rdp-cell-size: 80px;
          --rdp-accent-color: #4f46e5;
          margin: 0;
          max-width: 100%;
        }
        .calendar-large .rdp-day_selected { 
          background-color: var(--rdp-accent-color); 
          font-weight: bold; 
        }
        .calendar-large .rdp-day_today { 
          color: var(--rdp-accent-color); 
          font-weight: bold; 
        }
        .calendar-large .rdp-day { 
          font-size: 16px; 
          border-radius: 12px; 
        }
        .calendar-large .event-day { 
          background-color: #e0e7ff; 
          color: #4f46e5; 
          font-weight: bold; 
          border-radius: 12px; 
          border: 2px solid #c7d2fe;
        }
        .dark .calendar-large .event-day { 
          background-color: #312e81; 
          color: #a5b4fc; 
          border-color: #3730a3;
        }
      `}</style>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex-1 flex justify-center calendar-large">
          <DayPicker
            mode="single"
            modifiers={{ hasEvent: eventDates }}
            modifiersClassNames={{ hasEvent: 'event-day' }}
            onDayClick={handleDayClick}
            showOutsideDays
          />
        </div>

        <div className="lg:w-96 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm min-h-[300px]">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Selected Date</h3>
            
            {selectedEvent ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                  <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-1">Event</p>
                  <p className="text-xl font-bold text-slate-900">{selectedEvent.name}</p>
                </div>
                
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Coordinator / Assigned</p>
                  <p className="text-base font-medium text-slate-900 flex items-center gap-2">
                    <span className="size-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                      {selectedEvent.member_name ? selectedEvent.member_name.charAt(0) : '?'}
                    </span>
                    {selectedEvent.member_name || 'Unassigned'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center">
                <p>No events scheduled for this date.</p>
                <p className="text-sm mt-2">Click a highlighted date to view details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
