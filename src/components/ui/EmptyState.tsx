import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  hint?: string;
}

export function EmptyState({ icon: Icon, title, hint }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <span className="w-14 h-14 rounded-2xl bg-surface2 border border-line flex items-center justify-center text-ink3 mb-3">
        <Icon size={26} />
      </span>
      <div className="font-bold text-ink2">{title}</div>
      {hint && <div className="text-sm text-ink3 mt-1 max-w-xs">{hint}</div>}
    </div>
  );
}
