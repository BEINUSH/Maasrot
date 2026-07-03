import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  colorVar?: string;
  className?: string;
}

export function ProgressBar({ value, colorVar = 'var(--accent)', className = '' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`h-2 rounded-full bg-surface2 overflow-hidden ${className}`}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: colorVar }}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </div>
  );
}
