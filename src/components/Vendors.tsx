import { useState } from 'react';
import { Plus, Edit2, Trash2, Phone, Mail, Globe, Star, Store } from 'lucide-react';
import Modal from './Modal';
import type { Vendor, VendorCategory, VendorStatus } from '../types';

interface Props {
  vendors: Vendor[];
  onAdd: (v: Omit<Vendor, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Vendor>) => void;
  onDelete: (id: string) => void;
}

const CAT_LABEL: Record<VendorCategory, string> = {
  venue: 'אולם', catering: 'קייטרינג', music: 'מוזיקה/DJ',
  photography: 'צלם', videography: 'צלם וידאו', flowers: 'פרחים',
  makeup: 'איפור ועיצוב', transportation: 'הסעות', decoration: 'קישוטים',
  invitations: 'הזמנות', cake: 'עוגה', rabbi: 'רב', other: 'אחר',
};

const CAT_EMOJI: Record<VendorCategory, string> = {
  venue: '🏛️', catering: '🍽️', music: '🎵', photography: '📷',
  videography: '🎬', flowers: '💐', makeup: '💄', transportation: '🚌',
  decoration: '🎊', invitations: '✉️', cake: '🎂', rabbi: '✡️', other: '📦',
};

const STATUS_LABEL: Record<VendorStatus, string> = {
  researching: 'בחקירה', contacted: 'יצרנו קשר', meeting: 'נקבעה פגישה',
  contracted: 'חוזה חתום', deposit_paid: 'מקדמה שולמה', fully_paid: 'שולם במלואו',
};

const STATUS_COLOR: Record<VendorStatus, string> = {
  researching: 'bg-gray-100 text-gray-600',
  contacted: 'bg-blue-100 text-blue-600',
  meeting: 'bg-purple-100 text-purple-600',
  contracted: 'bg-amber-100 text-amber-700',
  deposit_paid: 'bg-orange-100 text-orange-700',
  fully_paid: 'bg-green-100 text-green-700',
};

const STATUS_ORDER: VendorStatus[] = ['researching', 'contacted', 'meeting', 'contracted', 'deposit_paid', 'fully_paid'];

const EMPTY: Omit<Vendor, 'id'> = {
  name: '', category: 'photography', contactName: '', phone: '', email: '',
  website: '', status: 'researching', totalPrice: 0, depositAmount: 0,
  depositPaid: false, fullyPaid: false, notes: '', rating: 0,
};

function fmt(n: number) { return n.toLocaleString('he-IL'); }

export default function Vendors({ vendors, onAdd, onUpdate, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState<Omit<Vendor, 'id'>>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<'all' | VendorCategory>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | VendorStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (v: Vendor) => {
    setEditing(v);
    setForm({ name: v.name, category: v.category, contactName: v.contactName ?? '', phone: v.phone ?? '', email: v.email ?? '', website: v.website ?? '', status: v.status, totalPrice: v.totalPrice ?? 0, depositAmount: v.depositAmount ?? 0, depositPaid: v.depositPaid, fullyPaid: v.fullyPaid, notes: v.notes ?? '', rating: v.rating ?? 0 });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) onUpdate(editing.id, form);
    else onAdd(form);
    setShowModal(false);
  };

  const cats = [...new Set(vendors.map(v => v.category))];
  const filtered = vendors.filter(v => {
    return (filterCat === 'all' || v.category === filterCat) && (filterStatus === 'all' || v.status === filterStatus);
  });

  const totalCost = vendors.reduce((s, v) => s + (v.totalPrice ?? 0), 0);
  const totalPaid = vendors.filter(v => v.fullyPaid).reduce((s, v) => s + (v.totalPrice ?? 0), 0);
  const contracted = vendors.filter(v => ['contracted', 'deposit_paid', 'fully_paid'].includes(v.status)).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'סה"כ ספקים', value: vendors.length, sub: `${contracted} חוזים`, color: 'text-gray-800' },
          { label: 'עלות כוללת', value: `₪${fmt(totalCost)}`, sub: 'מוערך', color: 'text-orange-700' },
          { label: 'שולם', value: `₪${fmt(totalPaid)}`, sub: 'לספקים', color: 'text-green-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-rose-100 p-3 text-center shadow-sm">
            <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
            <div className="text-xs text-gray-300">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters + add */}
      <div className="bg-white rounded-2xl border border-rose-100 p-3 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <button onClick={openAdd} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1 shrink-0">
            <Plus size={16} />הוסף ספק
          </button>
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_ORDER.map(s => (
              <button key={s} onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)} className={`text-xs px-2.5 py-1 rounded-full transition-colors ${filterStatus === s ? STATUS_COLOR[s] + ' ring-1 ring-current' : 'bg-gray-100 text-gray-500 hover:bg-rose-100'}`}>
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilterCat('all')} className={`text-xs px-3 py-1 rounded-full transition-colors ${filterCat === 'all' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-rose-100'}`}>כולם</button>
          {cats.map(c => (
            <button key={c} onClick={() => setFilterCat(filterCat === c ? 'all' : c)} className={`text-xs px-3 py-1 rounded-full transition-colors ${filterCat === c ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-rose-100'}`}>
              {CAT_EMOJI[c]} {CAT_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Vendor list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-rose-100 p-8 text-center shadow-sm">
          <Store size={32} className="text-rose-200 mx-auto mb-2" />
          <p className="text-gray-500">{vendors.length === 0 ? 'עוד לא הוספתם ספקים' : 'לא נמצאו ספקים'}</p>
          {vendors.length === 0 && (
            <button onClick={openAdd} className="mt-3 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-rose-600 transition-colors">הוסף ספק ראשון</button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(v => (
            <div key={v.id} className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-rose-50/30 transition-colors" onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}>
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                  {CAT_EMOJI[v.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 text-sm">{v.name}</span>
                    {v.rating && v.rating > 0 ? (
                      <span className="flex items-center gap-0.5 text-amber-500 text-xs">
                        <Star size={11} className="fill-amber-500" />{v.rating}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{CAT_LABEL[v.category]}</span>
                    {v.totalPrice ? <span className="text-xs text-gray-500">· ₪{fmt(v.totalPrice)}</span> : null}
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_COLOR[v.status]}`}>{STATUS_LABEL[v.status]}</span>
              </div>

              {expandedId === v.id && (
                <div className="px-4 pb-4 border-t border-rose-50 pt-3 space-y-3">
                  {/* Status progress */}
                  <div className="flex gap-1">
                    {STATUS_ORDER.map((s, i) => (
                      <button
                        key={s}
                        onClick={() => onUpdate(v.id, { status: s })}
                        className={`flex-1 h-1.5 rounded-full transition-colors ${STATUS_ORDER.indexOf(v.status) >= i ? 'bg-rose-400' : 'bg-gray-200'}`}
                        title={STATUS_LABEL[s]}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 text-center">{STATUS_LABEL[v.status]}</div>

                  {/* Contact info */}
                  <div className="flex flex-wrap gap-3">
                    {v.phone && (
                      <a href={`tel:${v.phone}`} className="flex items-center gap-1.5 text-blue-500 text-sm hover:text-blue-600">
                        <Phone size={13} />{v.phone}
                      </a>
                    )}
                    {v.email && (
                      <a href={`mailto:${v.email}`} className="flex items-center gap-1.5 text-blue-500 text-sm hover:text-blue-600">
                        <Mail size={13} />{v.email}
                      </a>
                    )}
                    {v.website && (
                      <a href={v.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-500 text-sm hover:text-blue-600">
                        <Globe size={13} />אתר
                      </a>
                    )}
                  </div>

                  {/* Payment info */}
                  {v.totalPrice ? (
                    <div className="grid grid-cols-3 gap-2 text-xs text-center">
                      <div className="bg-blue-50 rounded-lg p-2">
                        <div className="font-bold text-blue-700">₪{fmt(v.totalPrice)}</div>
                        <div className="text-blue-400">מחיר</div>
                      </div>
                      <div className={`rounded-lg p-2 ${v.depositPaid ? 'bg-green-50' : 'bg-orange-50'}`}>
                        <div className={`font-bold ${v.depositPaid ? 'text-green-700' : 'text-orange-700'}`}>
                          {v.depositAmount ? `₪${fmt(v.depositAmount)}` : '-'}
                        </div>
                        <div className={v.depositPaid ? 'text-green-400' : 'text-orange-400'}>
                          {v.depositPaid ? 'מקדמה ✓' : 'מקדמה'}
                        </div>
                      </div>
                      <div className={`rounded-lg p-2 ${v.fullyPaid ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <div className={`font-bold ${v.fullyPaid ? 'text-green-700' : 'text-gray-500'}`}>
                          {v.fullyPaid ? 'שולם ✓' : 'לא שולם'}
                        </div>
                        <div className={v.fullyPaid ? 'text-green-400' : 'text-gray-400'}>תשלום</div>
                      </div>
                    </div>
                  ) : null}

                  {v.notes && <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">{v.notes}</div>}

                  <div className="flex gap-2">
                    <button onClick={() => openEdit(v)} className="flex-1 flex items-center justify-center gap-1 py-2 border border-blue-200 text-blue-600 rounded-xl text-sm hover:bg-blue-50 transition-colors">
                      <Edit2 size={14} />ערוך
                    </button>
                    <button onClick={() => setDeleteId(v.id)} className="flex items-center justify-center gap-1 px-4 py-2 border border-red-200 text-red-500 rounded-xl text-sm hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />מחק
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'עריכת ספק' : 'הוספת ספק'} size="lg">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">שם הספק *</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.name} onChange={e => set('name', e.target.value)} placeholder="אורי צלם, להקת הנה טוב..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.category} onChange={e => set('category', e.target.value as VendorCategory)}>
                {(Object.entries(CAT_LABEL) as [VendorCategory, string][]).map(([v, l]) => <option key={v} value={v}>{CAT_EMOJI[v]} {l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.status} onChange={e => set('status', e.target.value as VendorStatus)}>
                {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">איש קשר</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.contactName ?? ''} onChange={e => set('contactName', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
              <input type="email" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.email ?? ''} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">אתר</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.website ?? ''} onChange={e => set('website', e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מחיר כולל (₪)</label>
              <input type="number" min={0} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.totalPrice || ''} onChange={e => set('totalPrice', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מקדמה (₪)</label>
              <input type="number" min={0} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.depositAmount || ''} onChange={e => set('depositAmount', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">דירוג (1-5)</label>
              <input type="number" min={0} max={5} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={form.rating || ''} onChange={e => set('rating', Number(e.target.value))} />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.depositPaid} onChange={e => set('depositPaid', e.target.checked)} className="rounded" />מקדמה שולמה
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.fullyPaid} onChange={e => set('fullyPaid', e.target.checked)} className="rounded" />שולם במלואו
            </label>
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

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="מחיקת ספק" size="sm">
        <p className="text-gray-600 mb-4">האם למחוק ספק זה?</p>
        <div className="flex gap-2">
          <button onClick={() => { if (deleteId) { onDelete(deleteId); setDeleteId(null); } }} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 transition-colors">מחק</button>
          <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">ביטול</button>
        </div>
      </Modal>
    </div>
  );
}
