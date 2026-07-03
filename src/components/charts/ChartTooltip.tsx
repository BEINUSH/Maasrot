interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  payload?: { label?: string; name?: string };
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  suffix?: string;
}

export function ChartTooltip({ active, payload, label, suffix = '' }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  const title = item.payload?.name ?? item.payload?.label ?? label;
  return (
    <div dir="rtl" className="card px-3 py-2 text-xs shadow-md">
      <div className="font-bold text-ink mb-0.5">{title}</div>
      <div className="text-ink2 tabular-nums">
        {typeof item.value === 'number' ? Math.round(item.value * 10) / 10 : item.value}
        {suffix}
      </div>
    </div>
  );
}
