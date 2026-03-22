import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import Chat from './pages/Chat';
import Analytics from './pages/Analytics';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden gradient-bg">
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:ticketId" element={<Chat />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
