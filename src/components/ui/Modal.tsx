import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

export function Modal({ open, onClose, title, children, footer, wide = false }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" dir="rtl">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`relative w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} max-h-[92vh] overflow-hidden flex flex-col card rounded-b-none sm:rounded-b-[1.25rem]`}
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 48, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <h2 className="text-lg font-bold">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-ink3 hover:bg-surface2 hover:text-ink transition-colors"
                aria-label="סגירה"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4 flex-1">{children}</div>
            {footer && <div className="px-5 py-4 border-t border-line flex gap-2 justify-start">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
