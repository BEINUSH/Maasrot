import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface FabAction {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

interface FabProps {
  actions: FabAction[];
}

export function Fab({ actions }: FabProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start gap-3">
      <AnimatePresence>
        {open &&
          actions.map((action, i) => (
            <motion.button
              key={action.label}
              type="button"
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.9 }}
              transition={{ delay: (actions.length - 1 - i) * 0.04 }}
              onClick={() => {
                setOpen(false);
                action.onClick();
              }}
              className="flex items-center gap-2 card px-4 py-3 text-sm font-semibold hover:border-accent/50 transition-colors"
            >
              <action.icon size={17} className="text-accent" />
              {action.label}
            </motion.button>
          ))}
      </AnimatePresence>
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((o) => !o)}
        aria-label="פעולות מהירות"
        aria-expanded={open}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent2 text-white shadow-lg shadow-accent/30 flex items-center justify-center"
      >
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ type: 'spring', damping: 18 }}>
          <Plus size={26} strokeWidth={2.4} />
        </motion.span>
      </motion.button>
    </div>
  );
}
