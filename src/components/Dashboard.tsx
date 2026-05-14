import type { MonthSummary } from '../types';
import { formatNIS, monthLabel } from '../utils/calculations';

interface Props {
  summaries: MonthSummary[];
  onAddMonth: () => void;
  onAddDonation: () => void;
}

export default function Dashboard({ summaries, onAddMonth, onAddDonation }: Props) {
  const totalDeficit = summaries.reduce((s, m) => s + Math.max(0, m.deficit.total), 0);
  const totalFamilyDeficit = summaries.reduce((s, m) => s + Math.max(0, m.deficit.family), 0);
  const totalExternalDeficit = summaries.reduce((s, m) => s + Math.max(0, m.deficit.external), 0);

  const pendingMonths = summaries.filter((m) => m.deficit.total > 0.01);
  const currentDate = new Date();
  const currentId = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const currentMonth = summaries.find((m) => m.record.id === currentId);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="סה״כ חוב פתוח"
          amount={totalDeficit}
          color={totalDeficit > 0 ? 'red' : 'green'}
          subtitle={totalDeficit > 0 ? 'יש הפרשות שלא שולמו' : 'מעולה! הכל שולם'}
        />
        <SummaryCard
          title="חוב למשפחה"
          amount={totalFamilyDeficit}
          color={totalFamilyDeficit > 0 ? 'orange' : 'green'}
        />
        <SummaryCard
          title="חוב לחיצוניים"
          amount={totalExternalDeficit}
          color={totalExternalDeficit > 0 ? 'orange' : 'green'}
        />
      </div>

      {/* Current month */}
      {currentMonth ? (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            החודש הנוכחי — {monthLabel(currentMonth.record.year, currentMonth.record.month)}
          </h2>
          <MonthBar summary={currentMonth} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 mb-3">לא הוזנה הכנסה לחודש הנוכחי</p>
          <button
            onClick={onAddMonth}
            className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            הוסף הכנסה לחודש הנוכחי
          </button>
        </div>
      )}

      {/* Pending months */}
      {pendingMonths.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">חודשים עם יתרה לתשלום</h2>
            <button
              onClick={onAddDonation}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + הוסף תרומה
            </button>
          </div>
          <div className="space-y-3">
            {pendingMonths.map((m) => (
              <MonthBar key={m.record.id} summary={m} />
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onAddMonth}
          className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-sm font-medium hover:bg-emerald-100 transition-colors text-center"
        >
          📅 הוסף חודש חדש
        </button>
        <button
          onClick={onAddDonation}
          className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-2xl text-sm font-medium hover:bg-blue-100 transition-colors text-center"
        >
          💝 רשום תרומה
        </button>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  amount,
  color,
  subtitle,
}: {
  title: string;
  amount: number;
  color: 'red' | 'green' | 'orange';
  subtitle?: string;
}) {
  const colors = {
    red: 'bg-red-50 border-red-200 text-red-700',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    orange: 'bg-amber-50 border-amber-200 text-amber-700',
  };
  return (
    <div className={`rounded-2xl p-5 border ${colors[color]}`}>
      <p className="text-sm font-medium opacity-70 mb-1">{title}</p>
      <p className="text-2xl font-bold">{formatNIS(amount)}</p>
      {subtitle && <p className="text-xs mt-1 opacity-60">{subtitle}</p>}
    </div>
  );
}

function MonthBar({ summary }: { summary: MonthSummary }) {
  const { record, obligation, given, deficit } = summary;
  const pct = obligation.total > 0 ? Math.min(100, (given.total / obligation.total) * 100) : 100;
  const isPaid = deficit.total <= 0.01;

  return (
    <div className="border border-gray-100 rounded-xl p-4">
      <div className="flex justify-between items-start mb-2">
        <span className="font-medium text-gray-800">
          {monthLabel(record.year, record.month)}
          <span className="mr-2 text-xs text-gray-400">
            ({record.givingLevel === 'chomesh' ? 'חומש' : 'מעשר'})
          </span>
        </span>
        <span className={`text-sm font-semibold ${isPaid ? 'text-emerald-600' : 'text-red-500'}`}>
          {isPaid ? 'שולם ✓' : `חוב: ${formatNIS(deficit.total)}`}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all ${isPaid ? 'bg-emerald-500' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
        <div>
          <span className="block text-gray-400">חובה</span>
          <span className="font-medium text-gray-700">{formatNIS(obligation.total)}</span>
        </div>
        <div>
          <span className="block text-gray-400">ניתן</span>
          <span className="font-medium text-gray-700">{formatNIS(given.total)}</span>
        </div>
        <div>
          <span className="block text-gray-400">משפחה / חיצוני</span>
          <span className="font-medium text-gray-700">
            {formatNIS(given.family)} / {formatNIS(given.external)}
          </span>
        </div>
      </div>
    </div>
  );
}
