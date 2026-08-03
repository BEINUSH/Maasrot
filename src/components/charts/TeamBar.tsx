import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TeamId } from '../../types';
import { TEAMS, TEAM_META, teamLabel } from '../../lib/constants';
import { ChartTooltip } from './ChartTooltip';

interface TeamBarProps {
  distribution: Record<TeamId, number>;
}

export function TeamBar({ distribution }: TeamBarProps) {
  const data = TEAMS.map((team) => ({
    name: teamLabel(team),
    value: distribution[team],
    color: TEAM_META[team].chartVar,
  }));

  return (
    <div className="h-64" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 8, left: 8, bottom: 0 }} barCategoryGap="30%">
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--chart-ink)', fontSize: 12, fontFamily: 'inherit' }}
            axisLine={{ stroke: 'var(--chart-grid)' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: 'var(--chart-ink)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip cursor={{ fill: 'color-mix(in oklab, var(--ink-3) 10%, transparent)' }} content={<ChartTooltip suffix=" חניכים" />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={72} label={{ position: 'top', fill: 'var(--ink-2)', fontSize: 13, fontWeight: 700 }}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
