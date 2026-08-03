import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { DbShape } from '../../types';
import { METRICS, PERIOD_LABELS } from '../../lib/constants';
import { cadetMetricComparisons } from '../../lib/selectors';
import type { Trend } from '../../lib/selectors';
import { formatSeconds } from '../../lib/date';

interface TestComparisonCardProps {
  db: DbShape;
  cadetId: string;
}

function TrendBadge({ trend }: { trend?: Trend }) {
  if (trend === undefined) return <span className="text-ink3 text-xs">—</span>;
  if (trend === 'up') {
    return (
      <span className="inline-flex items-center gap-1 text-lvla font-bold text-xs">
        <TrendingUp size={15} />
        שיפור
      </span>
    );
  }
  if (trend === 'down') {
    return (
      <span className="inline-flex items-center gap-1 text-lvlc font-bold text-xs">
        <TrendingDown size={15} />
        ירידה
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-ink3 font-bold text-xs">
      <Minus size={15} />
      ללא שינוי
    </span>
  );
}

export function TestComparisonCard({ db, cadetId }: TestComparisonCardProps) {
  const comparisons = cadetMetricComparisons(
    db,
    cadetId,
    METRICS.map((m) => ({ key: m.key, lowerIsBetter: m.lowerIsBetter })),
  );

  const format = (key: string, value?: number): string => {
    if (value === undefined) return '—';
    const meta = METRICS.find((m) => m.key === key);
    return meta?.isTime && key === 'run3kSeconds' ? formatSeconds(value) : String(value);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[480px]">
        <thead>
          <tr className="text-xs text-ink3 border-b border-line">
            <th className="text-start py-2 px-2 font-semibold">מדד</th>
            <th className="text-center py-2 px-2 font-semibold">{PERIOD_LABELS.opening}</th>
            <th className="text-center py-2 px-2 font-semibold">{PERIOD_LABELS.mid}</th>
            <th className="text-center py-2 px-2 font-semibold">{PERIOD_LABELS.final}</th>
            <th className="text-center py-2 px-2 font-semibold">מגמה</th>
          </tr>
        </thead>
        <tbody>
          {METRICS.map((metric) => {
            const comparison = comparisons.find((c) => c.key === metric.key);
            return (
              <tr key={metric.key} className="border-b border-line last:border-0">
                <td className="py-2.5 px-2 font-semibold">{metric.label}</td>
                <td className="py-2.5 px-2 text-center tabular-nums">{format(metric.key, comparison?.opening)}</td>
                <td className="py-2.5 px-2 text-center tabular-nums">{format(metric.key, comparison?.mid)}</td>
                <td className="py-2.5 px-2 text-center tabular-nums">{format(metric.key, comparison?.final)}</td>
                <td className="py-2.5 px-2 text-center">
                  <TrendBadge trend={comparison?.trend} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
