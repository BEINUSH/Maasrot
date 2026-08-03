import { useId } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className = '' }: TabsProps) {
  const groupId = useId();
  return (
    <div
      className={`flex gap-1 p-1 rounded-2xl bg-surface2 border border-line overflow-x-auto ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive ? 'text-ink' : 'text-ink3 hover:text-ink2'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={`tab-pill-${groupId}`}
                className="absolute inset-0 rounded-xl bg-surface shadow-sm border border-line"
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {Icon && <Icon size={15} />}
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
