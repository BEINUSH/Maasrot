import { useState } from 'react';
import { Plus, Edit2, Trash2, CheckSquare, Square, Calendar, Filter } from 'lucide-react';
import Modal from './Modal';
import type { Task, TaskCategory, TaskPriority, TaskStatus } from '../types';

interface Props {
  tasks: Task[];
  onAdd: (t: Omit<Task, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const CAT_LABEL: Record<TaskCategory, string> = {
  venue: 'אולם', guests: 'מוזמנים', budget: 'תקציב', vendors: 'ספקים',
  attire: 'לבוש', ceremony: 'טקס', reception: 'מסיבה', honeymoon: 'ירח דבש',
  legal: 'משפטי', beauty: 'יופי', music: 'מוזיקה', flowers: 'פרחים',
  food: 'אוכל', other: 'אחר',
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  urgent: 'דחוף', high: 'גבוה', medium: 'בינוני', low: 'נמוך',
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-gray-100 text-gray-600 border-gray-200',
};

const PRIORITY_ORDER: TaskPriority[] = ['urgent', 'high', 'medium', 'low'];

const EMPTY: Omit<Task, 'id'> = {
  title: '', description: '', category: 'other', priority: 'medium', status: 'todo', dueDate: '',
};

export default function Tasks({ tasks, onAdd, onUpdate, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState<Omit<Task, 'id'>>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | TaskStatus>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | TaskPriority>('all');
  const [filterCat, setFilterCat] = useState<'all' | TaskCategory>('all');
  const [showFilters, setShowFilters] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (t: Task) => {
    setEditing(t);
    setForm({ title: t.title, description: t.description ?? '', category: t.category, priority: t.priority, status: t.status, dueDate: t.dueDate ?? '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editing) onUpdate(editing.id, form);
    else onAdd(form);
    setShowModal(false);
  };

  const toggleDone = (t: Task) => {
    if (t.status === 'done') onUpdate(t.id, { status: 'todo', completedDate: undefined });
    else onUpdate(t.id, { status: 'done', completedDate: new Date().toISOString().slice(0, 10) });
  };

  const done = tasks.filter(t => t.status === 'done').length;
  const pct = tasks.length > 0 ? Math.round(done / tasks.length * 100) : 0;

  const filtered = tasks.filter(t => {
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchCat = filterCat === 'all' || t.category === filterCat;
    return matchStatus && matchPriority && matchCat;
  }).sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    const po = { urgent: 0, high: 1, medium: 2, low: 3 };
    if (po[a.priority] !== po[b.priority]) return po[a.priority] - po[b.priority];
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  const usedCats = [...new Set(tasks.map(t => t.category))];

  const isOverdue = (t: Task) => t.status !== 'done' && !!t.dueDate && new Date(t.dueDate) < new Date();

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-700">התקדמות</span>
          <span className="text-sm text-gray-500">{done}/{tasks.length} הושלמו ({pct}%)</span>
        </div>
        <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-3 mt-3 text-sm">
          {[
            { label: 'דחוף', count: tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length, color: 'text-red-600' },
            { label: 'גבוה', count: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length, color: 'text-orange-600' },
            { label: 'הושלמו', count: done, color: 'text-green-600' },
            { label: 'שעבר זמנן', count: tasks.filter(isOverdue).length, color: 'text-red-500' },
          ].map(s => s.count > 0 ? (
            <span key={s.label} className={`${s.color} font-medium`}>{s.count} {s.label}</span>
          ) : null)}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={openAdd} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1">
          <Plus size={16} />הוסף משימה
        </button>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors border ${showFilters ? 'bg-rose-50 border-rose-300 text-rose-600' : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300'}`}>
          <Filter size={14} />סינון
        </button>
        <div className="flex gap-1.5">
          {(['all', 'todo', 'in_progress', 'done'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`text-xs px-3 py-1.5 rounded-full transition-colors ${filterStatus === s ? 'bg-rose-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300'}`}>
              {s === 'all' ? 'כולם' : s === 'todo' ? 'לביצוע' : s === 'in_progress' ? 'בביצוע' : 'הושלמו'}
            </button>
          ))}
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-rose-100 p-3 shadow-sm space-y-2">
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-xs text-gray-500 self-center">עדיפות:</span>
            {(['all', ...PRIORITY_ORDER] as const).map(p => (
              <button key={p} onClick={() => setFilterPriority(p)} className={`text-xs px-3 py-1 rounded-full transition-colors ${filterPriority === p ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-rose-100'}`}>
                {p === 'all' ? 'הכל' : PRIORITY_LABEL[p]}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-xs text-gray-500 self-center">קטגוריה:</span>
            <button onClick={() => setFilterCat('all')} className={`text-xs px-3 py-1 rounded-full transition-colors ${filterCat === 'all' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-rose-100'}`}>הכל</button>
            {usedCats.map(c => (
              <button key={c} onClick={() => setFilterCat(c)} className={`text-xs px-3 py-1 rounded-full transition-colors ${filterCat === c ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-rose-100'}`}>{CAT_LABEL[c]}</button>
            ))}
          </div>
        </div>
      )}

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-rose-100 p-8 text-center shadow-sm">
          <CheckSquare size={32} className="text-rose-200 mx-auto mb-2" />
          <p className="text-gray-500">לא נמצאו משימות</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-rose-50">
            {filtered.map(t => (
              <div key={t.id} className={`flex items-start gap-3 p-3 hover:bg-rose-50/30 transition-colors ${t.status === 'done' ? 'opacity-60' : ''} ${isOverdue(t) ? 'bg-red-50/30' : ''}`}>
                <button onClick={() => toggleDone(t)} className="mt-0.5 shrink-0">
                  {t.status === 'done'
                    ? <CheckSquare size={20} className="text-green-500 fill-green-500" />
                    : <Square size={20} className="text-gray-300 hover:text-rose-400 transition-colors" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className={`text-sm font-medium ${t.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>{t.title}</span>
                      {t.description && <div className="text-xs text-gray-500 mt-0.5">{t.description}</div>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-50 transition-colors"><Edit2 size={12} /></button>
                      <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"><Trash2 size={12} /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_COLOR[t.priority]}`}>{PRIORITY_LABEL[t.priority]}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{CAT_LABEL[t.category]}</span>
                    {t.status === 'in_progress' && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">בביצוע</span>
                    )}
                    {t.dueDate && (
                      <span className={`text-xs flex items-center gap-0.5 ${isOverdue(t) ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        <Calendar size={10} />
                        {new Date(t.dueDate).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: '2-digit' })}
                        {isOverdue(t) && ' ⚠️'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'עריכת משימה' : 'הוספת משימה'}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">כותרת *</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.title} onChange={e => set('title', e.target.value)} placeholder="הזמינו צלם, שלחו הזמנות..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
            <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400 resize-none" rows={2} value={form.description ?? ''} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.category} onChange={e => set('category', e.target.value as TaskCategory)}>
                {(Object.entries(CAT_LABEL) as [TaskCategory, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">עדיפות</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.priority} onChange={e => set('priority', e.target.value as TaskPriority)}>
                {PRIORITY_ORDER.map(p => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.status} onChange={e => set('status', e.target.value as TaskStatus)}>
                <option value="todo">לביצוע</option>
                <option value="in_progress">בביצוע</option>
                <option value="done">הושלם</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תאריך יעד</label>
              <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.dueDate ?? ''} onChange={e => set('dueDate', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={!form.title.trim()} className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-200 text-white font-semibold py-2.5 rounded-xl transition-colors">שמור</button>
            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">ביטול</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="מחיקת משימה" size="sm">
        <p className="text-gray-600 mb-4">האם למחוק משימה זו?</p>
        <div className="flex gap-2">
          <button onClick={() => { if (deleteId) { onDelete(deleteId); setDeleteId(null); } }} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 transition-colors">מחק</button>
          <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">ביטול</button>
        </div>
      </Modal>
    </div>
  );
}
