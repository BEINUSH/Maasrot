import { useState } from 'react';
import type { Recipient, RecipientType } from '../types';

interface Props {
  recipients: Recipient[];
  onAdd: (r: Recipient) => void;
  onDelete: (id: string) => void;
}

export default function Recipients({ recipients, onAdd, onDelete }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<RecipientType>('family');
  const [notes, setNotes] = useState('');
  const [filter, setFilter] = useState<RecipientType | 'all'>('all');

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ id: Date.now().toString(), name: name.trim(), type, notes: notes.trim() || undefined });
    setName('');
    setNotes('');
  }

  const filtered = recipients.filter((r) => filter === 'all' || r.type === filter);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">הוספת מקבל</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="שם המקבל..."
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <label
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-sm transition-colors ${
                type === 'family'
                  ? 'border-orange-400 bg-orange-50 text-orange-800'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              <input
                type="radio"
                value="family"
                checked={type === 'family'}
                onChange={() => setType('family')}
                className="accent-orange-500"
              />
              משפחה
            </label>
            <label
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-sm transition-colors ${
                type === 'external'
                  ? 'border-blue-400 bg-blue-50 text-blue-800'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              <input
                type="radio"
                value="external"
                checked={type === 'external'}
                onChange={() => setType('external')}
                className="accent-blue-500"
              />
              חיצוני
            </label>
          </div>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="הערות (אופציונלי)..."
          />
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-2 rounded-xl font-medium text-sm hover:bg-emerald-700 transition-colors"
          >
            הוסף מקבל
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">רשימת מקבלים</h2>
          <div className="flex gap-1 text-xs">
            {(['all', 'family', 'external'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full border transition-colors ${
                  filter === f
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {f === 'all' ? 'הכל' : f === 'family' ? 'משפחה' : 'חיצוניים'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">אין מקבלים ברשימה</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50"
              >
                <div>
                  <span className="font-medium text-gray-800 text-sm">{r.name}</span>
                  {r.notes && <span className="block text-xs text-gray-400">{r.notes}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      r.type === 'family'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {r.type === 'family' ? 'משפחה' : 'חיצוני'}
                  </span>
                  <button
                    onClick={() => onDelete(r.id)}
                    className="text-gray-300 hover:text-red-400 text-lg leading-none transition-colors"
                    title="מחק"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
