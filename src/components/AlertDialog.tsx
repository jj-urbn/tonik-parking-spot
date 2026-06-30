import { AnimatePresence, motion } from 'motion/react';
import { backdropTransition, exitTransition, spring } from '../lib/motion';
import { Button } from './Button';

const hatchStyle: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(27,25,23,0.06) 4px, rgba(27,25,23,0.06) 5px)',
};

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-strong/10"
          style={hatchStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: exitTransition }}
          transition={backdropTransition}
        >
          <motion.div
            className="flex w-[400px] flex-col gap-8 bg-surface-strong p-8"
            initial={{ scale: 0.85, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0, transition: exitTransition }}
            transition={spring}
          >
            <div className="flex flex-col gap-2">
              <p className="text-sm text-strong">{title}</p>
              <p className="text-xs text-default">{body}</p>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
              <Button className="flex-1" variant="primary" onClick={onConfirm}>{confirmLabel}</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
