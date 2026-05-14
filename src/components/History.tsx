import { useState } from 'react';
import type { MonthSummary, Donation, Recipient, MonthRecord } from '../types';
import { formatNIS, monthLabel } from '../utils/calculations';

interface Props {
  summaries: MonthSummary[];
  donations: Donation[];
  recipients: Recipient[];
  onEditMonth: (r: MonthRecord) => void;
  onDeleteMonth: (id: string) => void;
  onDeleteDonation: (id: string) => void;
  onAddDonation: (forMonth: string) => void;
}

export default function History({
  summaries,
  donations,
  recipients,
  onEditMonth,
  onDeleteMonth,
  onDeleteDonation,
  onAddDonation,
}: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = [...summaries].sort((a, b) => b.record.id.localeCompare(a.record.id));

  function recipientName(id: string): string {
    if (id.startsWith('new:')) return id.slice(4);
    return recipients.find((r) => r.id === id)?.name ?? 'לא ידוע';
  }

  return (
    <div className="space-y-3">
      {sorted.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm shadow-sm border border-gray-100">
          אין רשומות עדיין
        </div>
      )}
      {sorted.map((s) => {
        const isOpen = expanded === s.record.id;
        const monthDonations = donations.filter((d) => d.forMonth === s.record.id);
        const isPaid = s.deficit.total <= 0.01;

        return (
          <div key={s.record.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : s.record.id)}
              className="w-full flex items-center justify-between p-4 text-right hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-800">
                  {monthLabel(s.record.year, s.record.month)}
                </span>
                <span className="text-xs text-gray-400">
                  {s.record.givingLevel === 'chomesh' ? 'חומש' : 'מעשר'}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                  }`}
                >
                  {isPaid ? 'שולם' : `חוב ${formatNIS(s.deficit.total)}`}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{formatNIS(s.record.income)}</span>
                <span className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'}>▾</span>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-gray-100 p-4 space-y-4">
                {/* Obligations grid */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <ObligationCell label="חובה כוללת" value={s.obligation.total} />
                  <ObligationCell label="חובה משפחה" value={s.obligation.family} color="orange" />
                  <ObligationCell label="חובה חיצוניים" value={s.obligation.external} color="blue" />
                  <ObligationCell label="ניתן כוללת" value={s.given.total} />
                  <ObligationCell label="ניתן משפחה" value={s.given.family} color="orange" />
                  <ObligationCell label="ניתן חיצוניים" value={s.given.external} color="blue" />
                </div>

                {/* Deficits */}
                {!isPaid && (
                  <div className="bg-red-50 rounded-xl p-3 text-sm text-red-700 space-y-1 border border-red-100">
                    <p className="font-medium">יתרה לתשלום:</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="block text-xs">כולל</span>
                        <span className="font-bold">{formatNIS(Math.max(0, s.deficit.total))}</span>
                      </div>
                      <div>
                        <span className="block text-xs">משפחה</span>
                        <span className="font-bold">{formatNIS(Math.max(0, s.deficit.family))}</span>
                      </div>
                      <div>
                        <span className="block text-xs">חיצוניים</span>
                        <span className="font-bold">{formatNIS(Math.max(0, s.deficit.external))}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Donations list */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">תרומות בחודש זה</p>
                    <button
                      onClick={() => onAddDonation(s.record.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      + הוסף תרומה
                    </button>
                  </div>
                  {monthDonations.length === 0 ? (
                    <p className="text-xs text-gray-400">אין תרומות רשומות</p>
                  ) : (
                    <div className="space-y-1.5">
                      {monthDonations.map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                d.category === 'family' ? 'bg-orange-400' : 'bg-blue-400'
                              }`}
                            />
                            <span className="text-gray-700">{recipientName(d.recipientId)}</span>
                            {d.notes && <span className="text-xs text-gray-400">({d.notes})</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{d.date}</span>
                            <span className="font-medium">{formatNIS(d.amount)}</span>
                            <button
                              onClick={() => onDeleteDonation(d.id)}
                              className="text-gray-300 hover:text-red-400 text-base leading-none transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onEditMonth(s.record)}
                    className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    עריכה
                  </button>
                  <button
                    onClick={() => onDeleteMonth(s.record.id)}
                    className="text-xs border border-red-100 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    מחק חודש
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ObligationCell({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: 'orange' | 'blue';
}) {
  const text = color === 'orange' ? 'text-orange-700' : color === 'blue' ? 'text-blue-700' : 'text-gray-800';
  return (
    <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
      <span className="block text-xs text-gray-400 mb-0.5">{label}</span>
      <span className={`font-semibold text-sm ${text}`}>{formatNIS(value)}</span>
    </div>
  );
}
