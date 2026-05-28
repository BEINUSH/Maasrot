import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Phone, ChevronDown, Users } from 'lucide-react';
import Modal from './Modal';
import type { Guest, GuestGroup, MealPreference, RSVPStatus, SeatingTable } from '../types';
import { generateId } from '../utils/storage';

interface Props {
  guests: Guest[];
  tables: SeatingTable[];
  onAdd: (g: Omit<Guest, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Guest>) => void;
  onDelete: (id: string) => void;
}

const RSVP_LABEL: Record<RSVPStatus, string> = { confirmed: 'מאשר', pending: 'ממתין', declined: 'לא מגיע' };
const RSVP_COLOR: Record<RSVPStatus, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  declined: 'bg-red-100 text-red-700',
};
const GROUP_LABEL: Record<GuestGroup, string> = {
  family_bride: 'משפחת כלה',
  family_groom: 'משפחת חתן',
  friends_bride: 'חברים (כלה)',
  friends_groom: 'חברים (חתן)',
  work: 'עבודה',
  other: 'אחר',
};
const MEAL_LABEL: Record<MealPreference, string> = {
  regular: 'רגיל',
  vegetarian: 'צמחוני',
  vegan: 'טבעוני',
  gluten_free: 'ללא גלוטן',
  kosher: 'כשר מהדרין',
};

const EMPTY: Omit<Guest, 'id'> = {
  name: '',
  phone: '',
  email: '',
  rsvp: 'pending',
  seats: 1,
  mealPreference: 'regular',
  group: 'family_bride',
  isChild: false,
  notes: '',
};

export default function Guests({ guests, tables, onAdd, onUpdate, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterRsvp, setFilterRsvp] = useState<'all' | RSVPStatus>('all');
  const [filterGroup, setFilterGroup] = useState<'all' | GuestGroup>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [form, setForm] = useState<Omit<Guest, 'id'>>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (g: Guest) => { setEditing(g); setForm({ name: g.name, phone: g.phone ?? '', email: g.email ?? '', rsvp: g.rsvp, seats: g.seats, mealPreference: g.mealPreference, group: g.group, isChild: g.isChild ?? false, notes: g.notes ?? '', tableId: g.tableId }); setShowModal(true); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) onUpdate(editing.id, form);
    else onAdd(form);
    setShowModal(false);
  };

  const filtered = guests.filter(g => {
    const matchSearch = !search || g.name.includes(search) || g.phone?.includes(search) || '';
    const matchRsvp = filterRsvp === 'all' || g.rsvp === filterRsvp;
    const matchGroup = filterGroup === 'all' || g.group === filterGroup;
    return matchSearch && matchRsvp && matchGroup;
  });

  const stats = {
    total: guests.length,
    totalSeats: guests.reduce((s, g) => s + g.seats, 0),
    confirmed: guests.filter(g => g.rsvp === 'confirmed').reduce((s, g) => s + g.seats, 0),
    pending: guests.filter(g => g.rsvp === 'pending').reduce((s, g) => s + g.seats, 0),
    declined: guests.filter(g => g.rsvp === 'declined').reduce((s, g) => s + g.seats, 0),
  };

  const tableName = (id?: string) => tables.find(t => t.id === id)?.name;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'סה"כ מושבים', value: stats.totalSeats, color: 'text-gray-800' },
          { label: 'מאשרים', value: stats.confirmed, color: 'text-green-600' },
          { label: 'ממתינים', value: stats.pending, color: 'text-yellow-600' },
          { label: 'לא מגיעים', value: stats.declined, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-rose-100 p-3 text-center shadow-sm">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-rose-100 p-3 shadow-sm space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={15} className="absolute top-2.5 right-3 text-gray-400" />
            <input
              className="w-full border border-gray-200 rounded-xl pr-8 pl-3 py-2 text-sm focus:outline-none focus:border-rose-400"
              placeholder="חפש שם, טלפון..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={openAdd} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1 shrink-0">
            <Plus size={16} />הוסף
          </button>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'confirmed', 'pending', 'declined'] as const).map(r => (
            <button
              key={r}
              onClick={() => setFilterRsvp(r)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${filterRsvp === r ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-rose-100'}`}
            >
              {r === 'all' ? 'כולם' : RSVP_LABEL[r]}
            </button>
          ))}
          <span className="text-gray-300 mx-1">|</span>
          {(['all', 'family_bride', 'family_groom', 'friends_bride', 'friends_groom', 'work', 'other'] as const).map(gr => (
            <button
              key={gr}
              onClick={() => setFilterGroup(gr)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${filterGroup === gr ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-rose-100'}`}
            >
              {gr === 'all' ? 'כל הקבוצות' : GROUP_LABEL[gr]}
            </button>
          ))}
        </div>
      </div>

      {/* Guest list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-rose-100 p-8 text-center shadow-sm">
          <Users size={32} className="text-rose-200 mx-auto mb-2" />
          <p className="text-gray-500">{guests.length === 0 ? 'עוד לא הוספתם מוזמנים' : 'לא נמצאו תוצאות'}</p>
          {guests.length === 0 && (
            <button onClick={openAdd} className="mt-3 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-rose-600 transition-colors">
              הוסף מוזמן ראשון
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-rose-50">
            {filtered.map(g => (
              <div key={g.id}>
                <div
                  className="flex items-center gap-3 p-3 hover:bg-rose-50/50 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === g.id ? null : g.id)}
                >
                  <div className="w-9 h-9 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-rose-600 font-semibold text-sm">{g.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 text-sm">{g.name}</span>
                      {g.seats > 1 && <span className="text-xs text-gray-400">+{g.seats - 1}</span>}
                      {g.isChild && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">ילד</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{GROUP_LABEL[g.group]}</span>
                      {tableName(g.tableId) && <span className="text-xs text-blue-500">• {tableName(g.tableId)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RSVP_COLOR[g.rsvp]}`}>{RSVP_LABEL[g.rsvp]}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${expandedId === g.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {expandedId === g.id && (
                  <div className="px-3 pb-3 bg-rose-50/30">
                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      {g.phone && (
                        <a href={`tel:${g.phone}`} className="flex items-center gap-1.5 text-gray-600 hover:text-rose-500">
                          <Phone size={13} />{g.phone}
                        </a>
                      )}
                      <div className="text-gray-500">{MEAL_LABEL[g.mealPreference]}</div>
                      {g.notes && <div className="col-span-2 text-gray-500 text-xs">{g.notes}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5 mr-2">
                        {(['confirmed', 'pending', 'declined'] as RSVPStatus[]).map(r => (
                          <button
                            key={r}
                            onClick={() => onUpdate(g.id, { rsvp: r })}
                            className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${g.rsvp === r ? RSVP_COLOR[r] + ' ring-1 ring-current' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                            {RSVP_LABEL[r]}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-1.5 mr-auto">
                        <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"><Edit2 size={13} /></button>
                        <button onClick={() => setDeleteId(g.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'עריכת מוזמן' : 'הוספת מוזמן'}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא *</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.name} onChange={e => set('name', e.target.value)} placeholder="ישראל ישראלי" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} placeholder="050-0000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מספר מושבים</label>
              <input type="number" min={1} max={20} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.seats} onChange={e => set('seats', Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">אישור הגעה</label>
            <div className="flex gap-2">
              {(['pending', 'confirmed', 'declined'] as RSVPStatus[]).map(r => (
                <button key={r} onClick={() => set('rsvp', r)} className={`flex-1 py-2 rounded-xl text-sm transition-colors ${form.rsvp === r ? RSVP_COLOR[r] + ' font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{RSVP_LABEL[r]}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">קבוצה</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.group} onChange={e => set('group', e.target.value as GuestGroup)}>
                {(Object.entries(GROUP_LABEL) as [GuestGroup, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תפריט</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.mealPreference} onChange={e => set('mealPreference', e.target.value as MealPreference)}>
                {(Object.entries(MEAL_LABEL) as [MealPreference, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          {tables.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שולחן</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.tableId ?? ''} onChange={e => set('tableId', e.target.value || undefined)}>
                <option value="">ללא שולחן</option>
                {tables.map(t => <option key={t.id} value={t.id}>{t.name} ({t.capacity} מקומות)</option>)}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isChild" className="rounded" checked={form.isChild ?? false} onChange={e => set('isChild', e.target.checked)} />
            <label htmlFor="isChild" className="text-sm text-gray-700">ילד</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
            <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400 resize-none" rows={2} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder="הערות נוספות..." />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={!form.name.trim()} className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-200 text-white font-semibold py-2.5 rounded-xl transition-colors">שמור</button>
            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">ביטול</button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="מחיקת מוזמן" size="sm">
        <p className="text-gray-600 mb-4">האם למחוק את המוזמן?</p>
        <div className="flex gap-2">
          <button onClick={() => { if (deleteId) { onDelete(deleteId); setDeleteId(null); } }} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 transition-colors">מחק</button>
          <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">ביטול</button>
        </div>
      </Modal>
    </div>
  );
}

// suppress unused import warning
void generateId;
