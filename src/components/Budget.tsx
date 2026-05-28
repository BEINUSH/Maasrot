import { useState } from 'react';
import { Plus, Edit2, Trash2, Wallet, TrendingUp } from 'lucide-react';
import Modal from './Modal';
import type { BudgetItem, ExpenseCategory } from '../types';
import { generateId } from '../utils/storage';

interface Props {
  budgetItems: BudgetItem[];
  totalBudget: number;
  onAdd: (item: Omit<BudgetItem, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<BudgetItem>) => void;
  onDelete: (id: string) => void;
  onUpdateBudget: (amount: number) => void;
}

const CAT_LABEL: Record<ExpenseCategory, string> = {
  venue: 'אולם',
  catering: 'קייטרינג',
  music: 'מוזיקה / DJ',
  photography: 'צילום',
  videography: 'וידאו',
  flowers: 'פרחים',
  invitations: 'הזמנות',
  dress: 'שמלה',
  groom_attire: 'חליפת חתן',
  rings: 'טבעות',
  makeup: 'איפור ועיצוב',
  honeymoon: 'ירח דבש',
  transportation: 'הסעות',
  accommodation: 'לינה',
  decoration: 'קישוטים',
  cake: 'עוגת חתונה',
  other: 'אחר',
};

const CAT_EMOJI: Record<ExpenseCategory, string> = {
  venue: '🏛️', catering: '🍽️', music: '🎵', photography: '📷',
  videography: '🎬', flowers: '💐', invitations: '✉️', dress: '👗',
  groom_attire: '🤵', rings: '💍', makeup: '💄', honeymoon: '✈️',
  transportation: '🚌', accommodation: '🏨', decoration: '🎊',
  cake: '🎂', other: '📦',
};

const EMPTY: Omit<BudgetItem, 'id'> = {
  name: '',
  category: 'venue',
  estimatedAmount: 0,
  actualAmount: 0,
  paidAmount: 0,
  notes: '',
};

function fmt(n: number) {
  return n.toLocaleString('he-IL');
}

export default function Budget({ budgetItems, totalBudget, onAdd, onUpdate, onDelete, onUpdateBudget }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BudgetItem | null>(null);
  const [form, setForm] = useState<Omit<BudgetItem, 'id'>>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<'all' | ExpenseCategory>('all');
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(totalBudget.toString());

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (item: BudgetItem) => {
    setEditing(item);
    setForm({ name: item.name, category: item.category, estimatedAmount: item.estimatedAmount, actualAmount: item.actualAmount, paidAmount: item.paidAmount, notes: item.notes ?? '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) onUpdate(editing.id, form);
    else onAdd(form);
    setShowModal(false);
  };

  const totalEstimated = budgetItems.reduce((s, b) => s + b.estimatedAmount, 0);
  const totalActual = budgetItems.reduce((s, b) => s + b.actualAmount, 0);
  const totalPaid = budgetItems.reduce((s, b) => s + b.paidAmount, 0);
  const remaining = totalBudget - totalActual;
  const actualPct = totalBudget > 0 ? Math.min(100, Math.round(totalActual / totalBudget * 100)) : 0;

  const categories = [...new Set(budgetItems.map(b => b.category))];
  const filtered = filterCat === 'all' ? budgetItems : budgetItems.filter(b => b.category === filterCat);

  const catSummary = categories.map(cat => ({
    cat,
    items: budgetItems.filter(b => b.category === cat),
    total: budgetItems.filter(b => b.category === cat).reduce((s, b) => s + b.actualAmount, 0),
    paid: budgetItems.filter(b => b.category === cat).reduce((s, b) => s + b.paidAmount, 0),
  })).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-4">
      {/* Budget overview */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet size={20} />
            <span className="font-semibold">תקציב כולל</span>
          </div>
          <button onClick={() => { setEditingBudget(true); setBudgetInput(totalBudget.toString()); }} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors">
            עדכן
          </button>
        </div>
        {editingBudget ? (
          <div className="flex gap-2 items-center">
            <input type="number" className="flex-1 bg-white/20 rounded-xl px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:bg-white/30 border border-white/30" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} />
            <button onClick={() => { onUpdateBudget(Number(budgetInput)); setEditingBudget(false); }} className="bg-white text-green-600 px-4 py-2 rounded-xl font-semibold text-sm">שמור</button>
            <button onClick={() => setEditingBudget(false)} className="text-white/80 hover:text-white px-3 py-2 text-sm">ביטול</button>
          </div>
        ) : (
          <div className="text-3xl font-bold mb-3">₪{fmt(totalBudget)}</div>
        )}
        <div className="w-full bg-white/30 rounded-full h-2.5 mb-2">
          <div className={`h-2.5 rounded-full transition-all ${actualPct > 95 ? 'bg-red-300' : 'bg-white'}`} style={{ width: `${actualPct}%` }} />
        </div>
        <div className="flex justify-between text-sm text-green-100">
          <span>₪{fmt(totalActual)} הוצאות</span>
          <span className={remaining < 0 ? 'text-red-200 font-semibold' : ''}>{remaining < 0 ? `חריגה: ₪${fmt(Math.abs(remaining))}` : `נשאר: ₪${fmt(remaining)}`}</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'הערכה', amount: totalEstimated, bg: 'bg-blue-50', text: 'text-blue-700', sub: 'text-blue-500' },
          { label: 'בפועל', amount: totalActual, bg: 'bg-orange-50', text: 'text-orange-700', sub: 'text-orange-500' },
          { label: 'שולם', amount: totalPaid, bg: 'bg-green-50', text: 'text-green-700', sub: 'text-green-500' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center border border-rose-50`}>
            <div className={`text-lg font-bold ${s.text}`}>₪{fmt(s.amount)}</div>
            <div className={`text-xs ${s.sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add button + filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={openAdd} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1">
          <Plus size={16} />הוסף הוצאה
        </button>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilterCat('all')} className={`text-xs px-3 py-1.5 rounded-full transition-colors ${filterCat === 'all' ? 'bg-rose-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300'}`}>הכל</button>
          {categories.map(c => (
            <button key={c} onClick={() => setFilterCat(c)} className={`text-xs px-3 py-1.5 rounded-full transition-colors ${filterCat === c ? 'bg-rose-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300'}`}>
              {CAT_EMOJI[c]} {CAT_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Category summary */}
      {catSummary.length > 0 && filterCat === 'all' && (
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-rose-50">
            <div className="flex items-center gap-2 text-gray-700">
              <TrendingUp size={16} className="text-rose-500" />
              <span className="font-semibold text-sm">פירוט לפי קטגוריה</span>
            </div>
          </div>
          <div className="divide-y divide-rose-50">
            {catSummary.map(({ cat, total, paid, items }) => (
              <div key={cat} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-xl w-7 text-center">{CAT_EMOJI[cat]}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{CAT_LABEL[cat]}</span>
                    <span className="text-sm font-bold text-gray-800">₪{fmt(total)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <div className="flex-1 h-1 bg-green-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: total > 0 ? `${Math.round(paid / total * 100)}%` : '0%' }} />
                    </div>
                    <span className="text-xs text-gray-400">{items.length} פריטים · ₪{fmt(paid)} שולם</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-rose-100 p-8 text-center shadow-sm">
          <Wallet size={32} className="text-rose-200 mx-auto mb-2" />
          <p className="text-gray-500">{budgetItems.length === 0 ? 'עוד לא הוספתם הוצאות' : 'לא נמצאו פריטים'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-rose-50">
            {filtered.map(item => {
              const paidPct = item.actualAmount > 0 ? Math.round(item.paidAmount / item.actualAmount * 100) : 0;
              return (
                <div key={item.id} className="p-3 hover:bg-rose-50/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="text-lg w-7 text-center shrink-0 mt-0.5">{CAT_EMOJI[item.category]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-gray-800 text-sm truncate">{item.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-50 transition-colors"><Edit2 size={13} /></button>
                          <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>הערכה: ₪{fmt(item.estimatedAmount)}</span>
                        <span>בפועל: <span className="font-medium text-gray-700">₪{fmt(item.actualAmount)}</span></span>
                        <span>שולם: <span className={`font-medium ${paidPct === 100 ? 'text-green-600' : 'text-orange-600'}`}>₪{fmt(item.paidAmount)}</span></span>
                      </div>
                      {item.actualAmount > 0 && (
                        <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${paidPct === 100 ? 'bg-green-500' : 'bg-amber-400'}`} style={{ width: `${paidPct}%` }} />
                        </div>
                      )}
                      {item.notes && <div className="text-xs text-gray-400 mt-1">{item.notes}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'עריכת הוצאה' : 'הוספת הוצאה'}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם *</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.name} onChange={e => set('name', e.target.value)} placeholder="צלם, אולם..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
            <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.category} onChange={e => set('category', e.target.value as ExpenseCategory)}>
              {(Object.entries(CAT_LABEL) as [ExpenseCategory, string][]).map(([v, l]) => <option key={v} value={v}>{CAT_EMOJI[v]} {l}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {([['estimatedAmount', 'הערכה (₪)'], ['actualAmount', 'בפועל (₪)'], ['paidAmount', 'שולם (₪)']] as [keyof Omit<BudgetItem,'id'>, string][]).map(([k, label]) => (
              <div key={k}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type="number" min={0} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={(form[k] as number) || ''} onChange={e => set(k, Number(e.target.value) as never)} />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
            <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400 resize-none" rows={2} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={!form.name.trim()} className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-200 text-white font-semibold py-2.5 rounded-xl transition-colors">שמור</button>
            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">ביטול</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="מחיקת הוצאה" size="sm">
        <p className="text-gray-600 mb-4">האם למחוק הוצאה זו?</p>
        <div className="flex gap-2">
          <button onClick={() => { if (deleteId) { onDelete(deleteId); setDeleteId(null); } }} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 transition-colors">מחק</button>
          <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">ביטול</button>
        </div>
      </Modal>
    </div>
  );
}

void generateId;
