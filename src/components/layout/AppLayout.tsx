import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { CalendarPlus, ListTodo, Trophy, UserPlus } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Fab } from '../ui/Fab';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ps-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="px-4 md:px-8 py-6 max-w-7xl mx-auto pb-28">
          <Outlet />
        </main>
      </div>
      <Fab
        actions={[
          { icon: UserPlus, label: 'הוספת חניך', onClick: () => navigate('/cadets?new=1') },
          { icon: CalendarPlus, label: 'מפגש אימון חדש', onClick: () => navigate('/attendance?new=1') },
          { icon: ListTodo, label: 'משימת סופ"ש חדשה', onClick: () => navigate('/missions?new=1') },
          { icon: Trophy, label: 'הוספת ניקוד', onClick: () => navigate('/scoreboard?add=1') },
        ]}
      />
    </div>
  );
}
