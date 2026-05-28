import { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, MapPin } from 'lucide-react';
import Modal from './Modal';
import type { TimelineEvent } from '../types';

interface Props {
  events: TimelineEvent[];
  weddingDate?: string;
  onAdd: (e: Omit<TimelineEvent, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<TimelineEvent>) => void;
  onDelete: (id: string) => void;
}

type EventCategory = TimelineEvent['category'];

const CAT_LABEL: Record<EventCategory, string> = {
  preparation: 'הכנות', ceremony: 'טקס', reception: 'מסיבה',
  transport: 'הסעה', photo: 'צילום', other: 'אחר',
};

const CAT_COLOR: Record<EventCategory, string> = {
  preparation: 'bg-blue-100 text-blue-700 border-blue-200',
  ceremony: 'bg-rose-100 text-rose-700 border-rose-200',
  reception: 'bg-purple-100 text-purple-700 border-purple-200',
  transport: 'bg-gray-100 text-gray-700 border-gray-200',
  photo: 'bg-amber-100 text-amber-700 border-amber-200',
  other: 'bg-green-100 text-green-700 border-green-200',
};

const CAT_DOT: Record<EventCategory, string> = {
  preparation: 'bg-blue-500', ceremony: 'bg-rose-500', reception: 'bg-purple-500',
  transport: 'bg-gray-500', photo: 'bg-amber-500', other: 'bg-green-500',
};

const EMPTY: Omit<TimelineEvent, 'id'> = {
  time: '09:00', endTime: '', title: '', location: '', description: '', category: 'other',
};

export default function Timeline({ events, weddingDate, onAdd, onUpdate, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<TimelineEvent | null>(null);
  const [form, setForm] = useState<Omit<TimelineEvent, 'id'>>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (e: TimelineEvent) => {
    setEditing(e);
    setForm({ time: e.time, endTime: e.endTime ?? '', title: e.title, location: e.location ?? '', description: e.description ?? '', category: e.category });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.time) return;
    if (editing) onUpdate(editing.id, form);
    else onAdd(form);
    setShowModal(false);
  };

  const sorted = [...events].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-700">לוח זמנים ליום החתונה</h3>
            {weddingDate && (
              <p className="text-sm text-gray-400 mt-0.5">
                {new Date(weddingDate).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
          <button onClick={openAdd} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1">
            <Plus size={16} />הוסף אירוע
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-3">
          {(Object.entries(CAT_LABEL) as [EventCategory, string][]).map(([k, v]) => (
            <span key={k} className={`text-xs px-2.5 py-1 rounded-full border ${CAT_COLOR[k]}`}>{v}</span>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-rose-100 p-8 text-center shadow-sm">
          <Clock size={32} className="text-rose-200 mx-auto mb-2" />
          <p className="text-gray-500">עוד לא הוספתם אירועים ליום החתונה</p>
          <p className="text-xs text-gray-400 mt-1">הוסיפו את לוח הזמנים: הכנות, טקס, קבלת פנים, ועוד</p>
          <button onClick={openAdd} className="mt-3 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-rose-600 transition-colors">
            הוסף אירוע ראשון
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute top-0 bottom-0 right-[2.35rem] w-0.5 bg-rose-100" />

          <div className="space-y-2">
            {sorted.map((event, idx) => {
              const isLast = idx === sorted.length - 1;
              return (
                <div key={event.id} className="flex gap-4 items-start relative">
                  {/* Time + dot */}
                  <div className="w-16 shrink-0 text-right">
                    <span className="text-sm font-bold text-gray-700">{event.time}</span>
                    {event.endTime && <div className="text-xs text-gray-400">{event.endTime}</div>}
                  </div>

                  <div className={`relative z-10 mt-1.5 w-4 h-4 rounded-full ${CAT_DOT[event.category]} border-2 border-white shadow shrink-0`} />

                  {/* Event card */}
                  <div className={`flex-1 bg-white rounded-xl border border-rose-100 p-3 shadow-sm hover:border-rose-200 transition-colors ${isLast ? '' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-800 text-sm">{event.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${CAT_COLOR[event.category]}`}>{CAT_LABEL[event.category]}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <MapPin size={11} />{event.location}
                          </div>
                        )}
                        {event.description && <div className="text-xs text-gray-400 mt-1">{event.description}</div>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => openEdit(event)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-50 transition-colors"><Edit2 size={12} /></button>
                        <button onClick={() => setDeleteId(event.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'עריכת אירוע' : 'הוספת אירוע'}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">כותרת *</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.title} onChange={e => set('title', e.target.value)} placeholder="קבלת פנים, טקס חופה, ארוחת ערב..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שעת התחלה *</label>
              <input type="time" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.time} onChange={e => set('time', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שעת סיום</label>
              <input type="time" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.endTime ?? ''} onChange={e => set('endTime', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(CAT_LABEL) as [EventCategory, string][]).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => set('category', k)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.category === k ? CAT_COLOR[k] : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-rose-300'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מיקום</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.location ?? ''} onChange={e => set('location', e.target.value)} placeholder="אולם הכניסה, גן..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">פרטים</label>
            <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400 resize-none" rows={2} value={form.description ?? ''} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={!form.title.trim()} className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-200 text-white font-semibold py-2.5 rounded-xl transition-colors">שמור</button>
            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">ביטול</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="מחיקת אירוע" size="sm">
        <p className="text-gray-600 mb-4">האם למחוק אירוע זה?</p>
        <div className="flex gap-2">
          <button onClick={() => { if (deleteId) { onDelete(deleteId); setDeleteId(null); } }} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 transition-colors">מחק</button>
          <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">ביטול</button>
        </div>
      </Modal>
    </div>
  );
}
