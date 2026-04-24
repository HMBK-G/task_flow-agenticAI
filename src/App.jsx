import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Tasks from '@/pages/Tasks';
import People from '@/pages/People';
import Events from '@/pages/Events';
import Settings from '@/pages/Settings';
import Notifications from '@/pages/Notifications';
import CalendarView from '@/pages/CalendarView';
import ChatPanel from '@/components/ChatPanel';

const AuthenticatedApp = () => {
  const { isAuthenticated } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard onOpenChat={openChat} />} />
          <Route path="/tasks" element={<Tasks onOpenChat={openChat} />} />
          <Route path="/people" element={<People onOpenChat={openChat} />} />
          <Route path="/events" element={<Events onOpenChat={openChat} />} />
          <Route path="/calendar" element={<CalendarView onOpenChat={openChat} />} />
          <Route path="/settings" element={<Settings onOpenChat={openChat} />} />
          <Route path="/notifications" element={<Notifications onOpenChat={openChat} />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </main>
      <ChatPanel isOpen={isChatOpen} onClose={closeChat} />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
