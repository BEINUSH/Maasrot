import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ListTodo, Menu, Moon, Search, Sun, Users } from 'lucide-react';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import { useTheme } from '../../hooks/useTheme';
import { formatDate, hebrewToday } from '../../lib/date';
import { teamLabel } from '../../lib/constants';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { query, setQuery, results, hasResults } = useGlobalSearch();
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef<number>(0);
  const navigate = useNavigate();

  const go = (path: string) => {
    setQuery('');
    setFocused(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-20 bg-page/80 backdrop-blur-md border-b border-line">
      <div className="flex items-center gap-3 px-4 md:px-8 h-16 max-w-7xl mx-auto">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="פתיחת תפריט"
          className="lg:hidden p-2.5 rounded-xl border border-line bg-surface text-ink2"
        >
          <Menu size={19} />
        </button>

        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3.5 text-ink3 pointer-events-none" />
          <input
            className="input-base ps-4 pe-10 !rounded-xl"
            style={{ paddingInlineStart: '2.5rem', paddingInlineEnd: '0.875rem' }}
            placeholder="חיפוש חניך, מפגש או משימה…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              blurTimer.current = window.setTimeout(() => setFocused(false), 150);
            }}
          />
          <AnimatePresence>
            {focused && query.trim() !== '' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute top-full mt-2 right-0 left-0 card p-2 shadow-lg max-h-80 overflow-y-auto"
                onMouseDown={() => window.clearTimeout(blurTimer.current)}
              >
                {!hasResults && <div className="px-3 py-2 text-sm text-ink3">לא נמצאו תוצאות</div>}
                {results.cadets.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => go(`/cadets/${c.id}`)}
                    className="w-full flex items-center gap-2 text-start px-3 py-2 rounded-lg hover:bg-surface2 text-sm"
                  >
                    <Users size={14} className="text-accent shrink-0" />
                    <span className="font-semibold">{c.fullName}</span>
                    <span className="text-xs text-ink3">{teamLabel(c.team)}</span>
                  </button>
                ))}
                {results.sessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => go(`/attendance?session=${s.id}`)}
                    className="w-full flex items-center gap-2 text-start px-3 py-2 rounded-lg hover:bg-surface2 text-sm"
                  >
                    <CalendarDays size={14} className="text-accent shrink-0" />
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-xs text-ink3">{formatDate(s.date)}</span>
                  </button>
                ))}
                {results.missions.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => go('/missions')}
                    className="w-full flex items-center gap-2 text-start px-3 py-2 rounded-lg hover:bg-surface2 text-sm"
                  >
                    <ListTodo size={14} className="text-accent shrink-0" />
                    <span className="font-semibold">{m.title}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="hidden md:block ms-auto text-sm font-semibold text-ink2">{hebrewToday()}</span>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="החלפת מצב תצוגה"
          className="ms-auto md:ms-0 p-2.5 rounded-xl border border-line bg-surface text-ink2 hover:text-ink transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
