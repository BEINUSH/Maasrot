import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  CalendarCheck,
  ClipboardList,
  Dumbbell,
  FileText,
  LayoutDashboard,
  ListTodo,
  Settings,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'לוח בקרה', icon: LayoutDashboard },
  { to: '/cadets', label: 'חניכים', icon: Users },
  { to: '/attendance', label: 'נוכחות', icon: CalendarCheck },
  { to: '/tests', label: 'מבחני כושר', icon: Dumbbell },
  { to: '/plan', label: 'תוכנית אימונים', icon: ClipboardList },
  { to: '/missions', label: 'משימות סופ"ש', icon: ListTodo },
  { to: '/scoreboard', label: 'טבלת ניקוד', icon: Trophy },
  { to: '/reports', label: 'דוחות', icon: FileText },
  { to: '/settings', label: 'הגדרות', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { settings } = useSettings();
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-6 border-b border-line">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent to-accent2 text-white flex items-center justify-center shadow-md shadow-accent/25">
            <BarChart3 size={21} />
          </span>
          <div className="min-w-0">
            <div className="font-extrabold leading-tight">{settings.appName}</div>
            <div className="text-[11px] text-ink3 leading-tight mt-0.5">{settings.subtitle}</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-gradient-to-l from-accent to-accent2 text-white shadow-sm'
                  : 'text-ink2 hover:bg-surface2 hover:text-ink'
              }`
            }
          >
            <item.icon size={18} strokeWidth={2.1} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-line">
        <div className="text-sm font-bold">{settings.managerName}</div>
        <div className="text-xs text-ink3">{settings.managerRole}</div>
      </div>
    </div>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <aside className="hidden lg:block fixed inset-y-0 right-0 w-64 bg-surface border-e border-line z-30">
        <SidebarContent />
      </aside>
      <AnimatePresence>
        {open && (
          <div className="lg:hidden fixed inset-0 z-50">
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="absolute inset-y-0 right-0 w-72 max-w-[85vw] bg-surface border-e border-line shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="סגירת תפריט"
                className="absolute top-4 left-4 p-2 rounded-lg text-ink3 hover:bg-surface2"
              >
                <X size={18} />
              </button>
              <SidebarContent onNavigate={onClose} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
