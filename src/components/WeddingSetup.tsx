import { useState } from 'react';
import { Heart, Calendar, MapPin, Wallet } from 'lucide-react';
import type { WeddingDetails } from '../types';

interface Props {
  details: WeddingDetails;
  onSave: (details: WeddingDetails) => void;
  isFirstTime?: boolean;
}

export default function WeddingSetup({ details, onSave, isFirstTime = false }: Props) {
  const [form, setForm] = useState<WeddingDetails>({ ...details });

  const set = (k: keyof WeddingDetails, v: string | number) =>
    setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="max-w-xl mx-auto py-6">
      {isFirstTime && (
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
              <Heart className="text-rose-500 fill-rose-500" size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ברוכים הבאים למתכנן החתונה!</h1>
          <p className="text-gray-500">בואו נתחיל עם כמה פרטים בסיסיים על החתונה שלכם</p>
        </div>
      )}

      {!isFirstTime && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">פרטי החתונה</h2>
          <p className="text-gray-500 text-sm mt-1">עדכנו את הפרטים הבסיסיים</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-rose-100 p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-2 text-rose-500 mb-1">
          <Heart size={18} className="fill-rose-500" />
          <span className="font-semibold text-gray-700">פרטי הזוג</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם הכלה</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              placeholder="שם הכלה"
              value={form.brideName}
              onChange={e => set('brideName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם החתן</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              placeholder="שם החתן"
              value={form.groomName}
              onChange={e => set('groomName', e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-rose-500 pt-1">
          <Calendar size={18} />
          <span className="font-semibold text-gray-700">תאריך ומיקום</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תאריך החתונה</label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              value={form.weddingDate ?? ''}
              onChange={e => set('weddingDate', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שעת הטקס</label>
            <input
              type="time"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              value={form.ceremonyTime ?? ''}
              onChange={e => set('ceremonyTime', e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-rose-500 pt-1">
          <MapPin size={18} />
          <span className="font-semibold text-gray-700">מיקום</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם האולם / מקום</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              placeholder="אולם השרון, גן עדן..."
              value={form.venue ?? ''}
              onChange={e => set('venue', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">עיר</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              placeholder="תל אביב, ירושלים..."
              value={form.city ?? ''}
              onChange={e => set('city', e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-rose-500 pt-1">
          <Wallet size={18} />
          <span className="font-semibold text-gray-700">תקציב</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תקציב כולל (₪)</label>
          <input
            type="number"
            min={0}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            placeholder="100000"
            value={form.totalBudget || ''}
            onChange={e => set('totalBudget', Number(e.target.value))}
          />
        </div>
      </div>

      <button
        onClick={() => onSave(form)}
        disabled={!form.brideName || !form.groomName}
        className="mt-6 w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-200 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
      >
        {isFirstTime ? 'בואו נתחיל!' : 'שמור שינויים'}
      </button>
    </div>
  );
}
