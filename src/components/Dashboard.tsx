import { Heart, Users, Wallet, CheckSquare, Store, Calendar, ChevronLeft, AlertCircle, Clock } from 'lucide-react';
import type { WeddingDetails, Guest, BudgetItem, Vendor, Task, Tab } from '../types';

interface Props {
  weddingDetails: WeddingDetails;
  guests: Guest[];
  budgetItems: BudgetItem[];
  vendors: Vendor[];
  tasks: Task[];
  onNavigate: (tab: Tab) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function fmt(n: number) {
  return n.toLocaleString('he-IL');
}

const PRIORITY_COLOR: Record<Task['priority'], string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

const PRIORITY_LABEL: Record<Task['priority'], string> = {
  urgent: 'דחוף', high: 'גבוה', medium: 'בינוני', low: 'נמוך',
};

export default function Dashboard({ weddingDetails, guests, budgetItems, vendors, tasks, onNavigate }: Props) {
  const days = daysUntil(weddingDetails.weddingDate);
  const confirmedSeats = guests.filter(g => g.rsvp === 'confirmed').reduce((s, g) => s + g.seats, 0);
  const totalSeats = guests.reduce((s, g) => s + g.seats, 0);
  const pendingCount = guests.filter(g => g.rsvp === 'pending').length;

  const totalBudget = weddingDetails.totalBudget;
  const totalSpent = budgetItems.reduce((s, b) => s + b.actualAmount, 0);
  const budgetPct = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const taskPct = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const contractedVendors = vendors.filter(v => ['contracted', 'deposit_paid', 'fully_paid'].includes(v.status)).length;

  const urgentTasks = tasks
    .filter(t => t.status !== 'done' && (t.priority === 'urgent' || t.priority === 'high'))
    .sort((a, b) => ({ urgent: 0, high: 1, medium: 2, low: 3 }[a.priority] - { urgent: 0, high: 1, medium: 2, low: 3 }[b.priority]))
    .slice(0, 5);

  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date());

  return (
    <div className="space-y-5">
      {/* Countdown Hero */}
      <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Heart size={16} className="fill-white" />
              <span className="text-rose-100 text-sm font-medium">
                {weddingDetails.brideName && weddingDetails.groomName
                  ? `${weddingDetails.brideName} ❤️ ${weddingDetails.groomName}`
                  : 'החתונה שלנו'}
              </span>
            </div>
            {days !== null ? (
              days > 0 ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">{days}</span>
                    <span className="text-2xl">ימים</span>
                  </div>
                  <div className="text-rose-100 text-sm mt-1">עד יום החתונה המיוחד! 🎉</div>
                </>
              ) : days === 0 ? (
                <div className="text-3xl font-bold">🎉 היום זה היום!</div>
              ) : (
                <div className="text-2xl font-bold">מזל טוב! 🎊 לפני {Math.abs(days)} ימים</div>
              )
            ) : (
              <>
                <div className="text-xl font-semibold text-rose-100">עוד לא נקבע תאריך</div>
                <button onClick={() => onNavigate('setup')} className="mt-2 text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
                  הגדירו תאריך
                </button>
              </>
            )}
          </div>
          <div className="text-left shrink-0">
            {weddingDetails.weddingDate && (
              <>
                <Calendar size={18} className="mr-auto mb-1 text-rose-200" />
                <div className="text-sm text-rose-100 text-right">{formatDate(weddingDetails.weddingDate)}</div>
                {weddingDetails.venue && <div className="text-xs text-rose-200 mt-1">📍 {weddingDetails.venue}</div>}
                {weddingDetails.ceremonyTime && <div className="text-xs text-rose-200 mt-0.5">🕐 {weddingDetails.ceremonyTime}</div>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            tab: 'guests' as Tab,
            icon: <Users size={18} className="text-blue-500" />,
            bg: 'bg-blue-50',
            bar: 'bg-blue-500',
            barBg: 'bg-blue-100',
            label: 'מוזמנים',
            main: `${totalSeats}`,
            sub: `${confirmedSeats} מאושרים · ${pendingCount} ממתינים`,
            pct: totalSeats > 0 ? Math.round(confirmedSeats / totalSeats * 100) : 0,
          },
          {
            tab: 'budget' as Tab,
            icon: <Wallet size={18} className="text-green-500" />,
            bg: 'bg-green-50',
            bar: 'bg-green-500',
            barBg: 'bg-green-100',
            label: 'תקציב',
            main: `${budgetPct}%`,
            sub: `₪${fmt(totalSpent)} מתוך ₪${fmt(totalBudget)}`,
            pct: budgetPct,
          },
          {
            tab: 'tasks' as Tab,
            icon: <CheckSquare size={18} className="text-purple-500" />,
            bg: 'bg-purple-50',
            bar: 'bg-purple-500',
            barBg: 'bg-purple-100',
            label: 'משימות',
            main: `${doneTasks}/${tasks.length}`,
            sub: `${taskPct}% הושלמו`,
            pct: taskPct,
          },
          {
            tab: 'vendors' as Tab,
            icon: <Store size={18} className="text-amber-500" />,
            bg: 'bg-amber-50',
            bar: 'bg-amber-500',
            barBg: 'bg-amber-100',
            label: 'ספקים',
            main: `${contractedVendors}/${vendors.length}`,
            sub: 'חוזים חתומים',
            pct: vendors.length > 0 ? Math.round(contractedVendors / vendors.length * 100) : 0,
          },
        ].map(s => (
          <button key={s.tab} onClick={() => onNavigate(s.tab)} className="bg-white rounded-2xl p-4 border border-rose-100 shadow-sm hover:border-rose-200 hover:shadow-md transition-all text-right">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center`}>{s.icon}</div>
              <span className="text-sm text-gray-500">{s.label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{s.main}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
            <div className={`mt-2 h-1.5 ${s.barBg} rounded-full overflow-hidden`}>
              <div className={`h-full ${s.bar} rounded-full`} style={{ width: `${s.pct}%` }} />
            </div>
          </button>
        ))}
      </div>

      {/* Budget quick summary */}
      {totalBudget > 0 && (
        <div className="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">סיכום תקציב</h3>
            <button onClick={() => onNavigate('budget')} className="text-rose-500 text-sm flex items-center gap-0.5">פרטים <ChevronLeft size={14} /></button>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-blue-50 rounded-xl p-2.5">
              <div className="text-sm font-bold text-blue-700">₪{fmt(totalBudget)}</div>
              <div className="text-xs text-blue-500">תקציב</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-2.5">
              <div className="text-sm font-bold text-orange-700">₪{fmt(totalSpent)}</div>
              <div className="text-xs text-orange-500">בפועל</div>
            </div>
            <div className={`rounded-xl p-2.5 ${totalBudget - totalSpent >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`text-sm font-bold ${totalBudget - totalSpent >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                ₪{fmt(Math.abs(totalBudget - totalSpent))}
              </div>
              <div className={`text-xs ${totalBudget - totalSpent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalBudget - totalSpent >= 0 ? 'נשאר' : 'חריגה'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overdue alert */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-red-500" />
            <span className="font-semibold text-red-700">משימות שעבר זמנן ({overdueTasks.length})</span>
          </div>
          {overdueTasks.slice(0, 3).map(task => (
            <div key={task.id} className="text-sm text-red-600 flex items-center gap-1 mt-1">
              <span>•</span><span>{task.title}</span>
              {task.dueDate && <span className="text-red-400 text-xs">({formatDate(task.dueDate)})</span>}
            </div>
          ))}
          {overdueTasks.length > 3 && (
            <button onClick={() => onNavigate('tasks')} className="text-xs text-red-500 mt-1">ועוד {overdueTasks.length - 3}...</button>
          )}
        </div>
      )}

      {/* Urgent tasks */}
      {urgentTasks.length > 0 && (
        <div className="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">משימות דחופות</h3>
            <button onClick={() => onNavigate('tasks')} className="text-rose-500 text-sm flex items-center gap-0.5">כל המשימות <ChevronLeft size={14} /></button>
          </div>
          <div className="space-y-2">
            {urgentTasks.map(task => (
              <div key={task.id} className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[task.priority]}`}>{PRIORITY_LABEL[task.priority]}</span>
                <span className="text-sm text-gray-700 flex-1">{task.title}</span>
                {task.dueDate && (
                  <span className="text-xs text-gray-400 flex items-center gap-0.5 shrink-0">
                    <Clock size={11} />{new Date(task.dueDate).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vendors needing attention */}
      {vendors.filter(v => ['researching', 'contacted'].includes(v.status)).length > 0 && (
        <div className="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">ספקים דורשים טיפול</h3>
            <button onClick={() => onNavigate('vendors')} className="text-rose-500 text-sm flex items-center gap-0.5">כל הספקים <ChevronLeft size={14} /></button>
          </div>
          <div className="space-y-2">
            {vendors.filter(v => ['researching', 'contacted'].includes(v.status)).slice(0, 4).map(v => (
              <div key={v.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{v.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${v.status === 'researching' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'}`}>
                  {v.status === 'researching' ? 'בחקירה' : 'יצרנו קשר'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {guests.length === 0 && budgetItems.length === 0 && vendors.length === 0 && (
        <div className="bg-rose-50 rounded-2xl border border-rose-100 p-5 text-center">
          <Heart size={32} className="text-rose-300 fill-rose-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">בואו נתחיל לתכנן!</h3>
          <p className="text-sm text-gray-500 mb-4">הוסיפו מוזמנים, ספקים, ותקציב כדי לראות כאן סיכום</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {[['guests', 'הוסף מוזמנים', 'bg-blue-500 hover:bg-blue-600'], ['vendors', 'הוסף ספקים', 'bg-amber-500 hover:bg-amber-600'], ['budget', 'הגדר תקציב', 'bg-green-500 hover:bg-green-600']].map(([tab, label, cls]) => (
              <button key={tab} onClick={() => onNavigate(tab as Tab)} className={`${cls} text-white text-sm px-4 py-2 rounded-xl transition-colors`}>{label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
