import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef } from 'react';

type Props = {
  open: boolean;
  title: string;
  body: string;
  onDismiss: () => void;
};

export function Toast({ open, title, body, onDismiss }: Props) {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onDismissRef.current(), 3000);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed top-6 right-6 w-80 bg-accent p-6 text-on-accent"
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        >
          <p className="text-xs font-normal text-on-accent">{title}</p>
          <p className="mt-1 text-xs text-on-accent-muted">{body}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
