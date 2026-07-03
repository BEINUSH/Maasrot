import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: LucideIcon;
  suffix?: string;
  formatter?: (value: number) => string;
  hint?: string;
  tintVar?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  suffix,
  formatter,
  hint,
  tintVar = 'var(--accent)',
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 flex items-start gap-3"
    >
      <span
        className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white"
        style={{ background: `linear-gradient(135deg, ${tintVar}, color-mix(in oklab, ${tintVar} 70%, black))` }}
      >
        <Icon size={19} strokeWidth={2.2} />
      </span>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-ink3">{label}</div>
        <div className="text-2xl font-extrabold leading-tight tabular-nums">
          {value === undefined ? (
            <span className="text-ink3">—</span>
          ) : (
            <span dir="ltr" className="inline-flex items-baseline gap-1">
              <AnimatedNumber value={value} formatter={formatter} />
              {suffix && <span className="text-sm font-bold text-ink2">{suffix}</span>}
            </span>
          )}
        </div>
        {hint && <div className="text-[11px] text-ink3 mt-0.5">{hint}</div>}
      </div>
    </motion.div>
  );
}
