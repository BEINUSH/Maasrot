import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  children?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-l from-accent to-accent2 text-white shadow-sm hover:opacity-90 border border-transparent',
  secondary: 'bg-surface2 text-ink border border-line hover:border-accent/50',
  ghost: 'bg-transparent text-ink2 border border-transparent hover:bg-surface2',
  danger: 'bg-lvlc/10 text-lvlc border border-lvlc/30 hover:bg-lvlc hover:text-white',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-5 py-3 gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      type={type}
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...(rest as object)}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 17} strokeWidth={2.2} />}
      {children}
    </motion.button>
  );
}
