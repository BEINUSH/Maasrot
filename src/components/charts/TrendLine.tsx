import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TrendPoint } from '../../lib/selectors';
import { ChartTooltip } from './ChartTooltip';

interface TrendLineProps {
  data: TrendPoint[];
  colorVar: string;
  suffix?: string;
  domain?: [number, number];
}

export function TrendLine({ data, colorVar, suffix = '', domain }: TrendLineProps) {
  return (
    <div className="h-56" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--chart-ink)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--chart-grid)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--chart-ink)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={34}
            domain={domain ?? ['auto', 'auto']}
          />
          <Tooltip
            cursor={{ stroke: 'var(--chart-ink)', strokeDasharray: '3 3' }}
            content={<ChartTooltip suffix={suffix} />}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={colorVar}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface-1)' }}
            isAnimationActive
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
