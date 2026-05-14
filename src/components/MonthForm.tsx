import { useState } from 'react';
import type { MonthRecord, GivingLevel } from '../types';
import { monthId, calcObligation, formatNIS } from '../utils/calculations';

interface Props {
  existing?: MonthRecord;
  onSave: (r: MonthRecord) => void;
  onCancel: () => void;
}

export default function MonthForm({ existing, onSave, onCancel }: Props) {
  const now = new Date();
  const [year, setYear] = useState(existing?.year ?? now.getFullYear());
  const [month, setMonth] = useState(existing?.month ?? now.getMonth() + 1);
  const [income, setIncome] = useState(existing?.income?.toString() ?? '');
  const [level, setLevel] = useState<GivingLevel>(existing?.givingLevel ?? 'maaser');
  const [notes, setNotes] = useState(existing?.notes ?? '');

  const incomeNum = parseFloat(income) || 0;
  const preview = calcObligation(incomeNum, level);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!incomeNum) return;
    onSave({
      id: monthId(year, month),
      year,
      month,
      income: incomeNum,
      givingLevel: level,
      notes: notes.trim() || undefined,
    });
  }

  const monthOptions = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-800">
        {existing ? 'עריכת חודש' : 'הוספת חודש חדש'}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">חודש</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {monthOptions.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">שנה</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            min={2020}
            max={2099}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">הכנסה (₪)</label>
        <input
          type="number"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="0"
          min={0}
          step={1}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">רמת הפרשה</label>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
              level === 'maaser'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            <input
              type="radio"
              value="maaser"
              checked={level === 'maaser'}
              onChange={() => setLevel('maaser')}
              className="accent-emerald-600"
            />
            <div>
              <span className="font-medium text-sm">מעשר</span>
              <span className="block text-xs opacity-70">10% מההכנסה</span>
            </div>
          </label>
          <label
            className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
              level === 'chomesh'
                ? 'border-blue-500 bg-blue-50 text-blue-800'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            <input
              type="radio"
              value="chomesh"
              checked={level === 'chomesh'}
              onChange={() => setLevel('chomesh')}
              className="accent-blue-600"
            />
            <div>
              <span className="font-medium text-sm">חומש</span>
              <span className="block text-xs opacity-70">20% מההכנסה</span>
            </div>
          </label>
        </div>
      </div>

      {incomeNum > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2 border border-gray-100">
          <p className="font-medium text-gray-700">חישוב מקדים:</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white rounded-lg p-2 border border-gray-100">
              <span className="block text-xs text-gray-400">סה״כ</span>
              <span className="font-bold text-gray-800">{formatNIS(preview.total)}</span>
            </div>
            <div className="bg-white rounded-lg p-2 border border-orange-100">
              <span className="block text-xs text-orange-400">משפחה</span>
              <span className="font-bold text-orange-700">{formatNIS(preview.family)}</span>
            </div>
            <div className="bg-white rounded-lg p-2 border border-blue-100">
              <span className="block text-xs text-blue-400">חיצוניים</span>
              <span className="font-bold text-blue-700">{formatNIS(preview.external)}</span>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">הערות (אופציונלי)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          rows={2}
          placeholder="הערות נוספות..."
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-emerald-700 transition-colors"
        >
          שמור
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
