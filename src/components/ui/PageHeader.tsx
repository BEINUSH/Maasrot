import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center justify-between gap-3 mb-6"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-l from-accent to-accent2 bg-clip-text text-transparent w-fit">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-ink3 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
