import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { FitnessLevel } from '../../types';
import { FITNESS_LEVELS, LEVEL_META } from '../../lib/constants';
import { ChartTooltip } from './ChartTooltip';

interface LevelDonutProps {
  distribution: Record<FitnessLevel, number>;
  labels: Record<FitnessLevel, string>;
  total: number;
}

export function LevelDonut({ distribution, labels, total }: LevelDonutProps) {
  const data = FITNESS_LEVELS.map((level) => ({
    name: `רמה ${labels[level]}`,
    value: distribution[level],
    color: LEVEL_META[level].chartVar,
    level,
  })).filter((d) => d.value > 0);

  return (
    <div>
      <div className="relative h-56" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="var(--surface-1)"
              strokeWidth={2}
              isAnimationActive
            >
              {data.map((entry) => (
                <Cell key={entry.level} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip suffix=" חניכים" />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold tabular-nums">{total}</span>
          <span className="text-xs text-ink3 font-semibold">חניכים</span>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-2 flex-wrap">
        {FITNESS_LEVELS.map((level) => (
          <span key={level} className="flex items-center gap-1.5 text-xs font-semibold text-ink2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: LEVEL_META[level].chartVar }} />
            {labels[level]}
            <span className="tabular-nums text-ink">{distribution[level]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
