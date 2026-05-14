import { useState } from 'react';
import type { Donation, Recipient, MonthRecord, RecipientType } from '../types';
import { monthLabel } from '../utils/calculations';

interface Props {
  months: MonthRecord[];
  recipients: Recipient[];
  defaultForMonth?: string;
  onSave: (d: Donation) => void;
  onCancel: () => void;
}

export default function DonationForm({ months, recipients, defaultForMonth, onSave, onCancel }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<RecipientType>('family');
  const [forMonth, setForMonth] = useState(defaultForMonth ?? (months[0]?.id ?? ''));
  const [notes, setNotes] = useState('');
  const [newRecipientName, setNewRecipientName] = useState('');
  const [addingNew, setAddingNew] = useState(false);

  const filteredRecipients = recipients.filter((r) => r.type === category);

  function handleRecipientChange(id: string) {
    setRecipientId(id);
    const r = recipients.find((x) => x.id === id);
    if (r) setCategory(r.type);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !forMonth) return;
    const finalRecipientId = addingNew
      ? `new:${newRecipientName.trim()}`
      : recipientId;
    onSave({
      id: Date.now().toString(),
      date,
      recipientId: finalRecipientId,
      amount: parseFloat(amount),
      category,
      forMonth,
      notes: notes.trim() || undefined,
    });
  }

  const sortedMonths = [...months].sort((a, b) => b.id.localeCompare(a.id));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-800">רישום תרומה</h2>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">עבור חודש</label>
        <select
          value={forMonth}
          onChange={(e) => setForMonth(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        >
          <option value="">בחר חודש...</option>
          {sortedMonths.map((m) => (
            <option key={m.id} value={m.id}>
              {monthLabel(m.year, m.month)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">תאריך התרומה</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">קטגוריה</label>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
              category === 'family'
                ? 'border-orange-400 bg-orange-50 text-orange-800'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            <input
              type="radio"
              value="family"
              checked={category === 'family'}
              onChange={() => { setCategory('family'); setRecipientId(''); }}
              className="accent-orange-500"
            />
            <div>
              <span className="font-medium text-sm">משפחה</span>
              <span className="block text-xs opacity-70">בני משפחה נצרכים</span>
            </div>
          </label>
          <label
            className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
              category === 'external'
                ? 'border-blue-400 bg-blue-50 text-blue-800'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            <input
              type="radio"
              value="external"
              checked={category === 'external'}
              onChange={() => { setCategory('external'); setRecipientId(''); }}
              className="accent-blue-500"
            />
            <div>
              <span className="font-medium text-sm">חיצוניים</span>
              <span className="block text-xs opacity-70">אנשים ועמותות</span>
            </div>
          </label>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-600">מקבל</label>
          <button
            type="button"
            onClick={() => { setAddingNew(!addingNew); setRecipientId(''); }}
            className="text-xs text-blue-600 hover:underline"
          >
            {addingNew ? 'בחר קיים' : '+ חדש'}
          </button>
        </div>
        {addingNew ? (
          <input
            type="text"
            value={newRecipientName}
            onChange={(e) => setNewRecipientName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="שם המקבל..."
            required
          />
        ) : (
          <select
            value={recipientId}
            onChange={(e) => handleRecipientChange(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">בחר מקבל...</option>
            {filteredRecipients.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
            {filteredRecipients.length === 0 && (
              <option disabled>אין מקבלים בקטגוריה זו — הוסף חדש</option>
            )}
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">סכום (₪)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="0"
          min={1}
          step={1}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">הערות (אופציונלי)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={2}
          placeholder="הערות..."
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
        >
          שמור תרומה
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}
