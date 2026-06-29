import { AnimatePresence, motion } from 'motion/react';
import { Button } from './Button';

type Props = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AlertDialog({ open, title, body, confirmLabel, cancelLabel, onConfirm, onCancel }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-strong/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-[400px] bg-surface p-8"
            initial={{ scale: 0.85, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          >
            <p className="text-sm text-strong">{title}</p>
            <p className="mt-2 text-xs text-muted">{body}</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
              <Button variant="primary" onClick={onConfirm}>{confirmLabel}</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
