import { useState } from 'react';
import { Dumbbell, GitCompareArrows } from 'lucide-react';
import type { TeamId, TestPeriod } from '../types';
import { useDb } from '../hooks/useDb';
import { useFitnessTests } from '../hooks/useFitnessTests';
import { testFor } from '../lib/selectors';
import { METRICS, PERIOD_LABELS, TEST_PERIODS, teamLabel } from '../lib/constants';
import { formatSeconds, parseTimeToSeconds } from '../lib/date';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { TeamFilter } from '../components/ui/TeamFilter';
import { SelectField } from '../components/ui/Field';
import { TestComparisonCard } from '../components/fitnessTests/TestComparisonCard';

export function FitnessTestsPage() {
  const db = useDb();
  const { upsertFitnessTest } = useFitnessTests();
  const [period, setPeriod] = useState<TestPeriod>('opening');
  const [teamFilter, setTeamFilter] = useState<TeamId | 'all'>('all');
  const [compareCadetId, setCompareCadetId] = useState(db.cadets[0]?.id ?? '');

  const cadets = [...db.cadets]
    .filter((c) => teamFilter === 'all' || c.team === teamFilter)
    .sort((a, b) => a.team - b.team || a.fullName.localeCompare(b.fullName, 'he'));

  const commit = (cadetId: string, key: (typeof METRICS)[number]['key'], raw: string, isTime: boolean) => {
    const value = isTime && key === 'run3kSeconds' ? parseTimeToSeconds(raw) : raw.trim() === '' ? undefined : Number(raw);
    upsertFitnessTest(cadetId, period, {
      [key]: value === undefined || Number.isNaN(value) ? undefined : value,
    });
  };

  const displayValue = (cadetId: string, key: (typeof METRICS)[number]['key']): string => {
    const value = testFor(db.fitnessTests, cadetId, period)?.[key];
    if (value === undefined) return '';
    return key === 'run3kSeconds' ? formatSeconds(value) : String(value);
  };

  return (
    <div>
      <PageHeader title="מבחני כושר" subtitle="ריצת 3 ק״מ · שכיבות סמיכה · עליות מתח · פלאנק · ברפיז" />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Tabs
          tabs={TEST_PERIODS.map((p) => ({ id: p, label: PERIOD_LABELS[p], icon: Dumbbell }))}
          active={period}
          onChange={(p) => setPeriod(p as TestPeriod)}
        />
        <TeamFilter value={teamFilter} onChange={setTeamFilter} />
      </div>

      <Card className="!p-0 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-xs text-ink3 border-b border-line bg-surface2/60">
                <th className="text-start py-3 px-4 font-semibold">חניך</th>
                {METRICS.map((m) => (
                  <th key={m.key} className="text-center py-3 px-2 font-semibold">
                    {m.label}
                    {m.key === 'run3kSeconds' && <span className="block text-[10px] font-normal">(דק:שנ)</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cadets.map((cadet) => (
                <tr key={cadet.id} className="border-b border-line last:border-0 hover:bg-surface2/40">
                  <td className="py-2 px-4">
                    <div className="font-bold whitespace-nowrap">{cadet.fullName}</div>
                    <div className="text-[11px] text-ink3">{teamLabel(cadet.team)}</div>
                  </td>
                  {METRICS.map((metric) => (
                    <td key={metric.key} className="py-2 px-2">
                      <input
                        key={`${period}-${cadet.id}-${metric.key}`}
                        className="input-base !py-1.5 text-center !w-24 mx-auto block tabular-nums"
                        dir="ltr"
                        defaultValue={displayValue(cadet.id, metric.key)}
                        placeholder="—"
                        inputMode={metric.key === 'run3kSeconds' ? 'text' : 'numeric'}
                        onBlur={(e) => commit(cadet.id, metric.key, e.target.value, metric.isTime)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <GitCompareArrows size={18} className="text-accent" />
            השוואה אישית
          </h3>
          <div className="min-w-56">
            <SelectField
              label=""
              value={compareCadetId}
              onChange={setCompareCadetId}
              options={db.cadets.map((c) => ({ value: c.id, label: c.fullName }))}
            />
          </div>
        </div>
        {compareCadetId && <TestComparisonCard db={db} cadetId={compareCadetId} />}
      </Card>
    </div>
  );
}
