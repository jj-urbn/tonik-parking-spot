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

  if (!open) return null;
  return (
    <div className="fixed top-6 right-6 w-80 bg-accent p-6 text-on-accent">
      <p className="text-xs font-normal text-on-accent">{title}</p>
      <p className="mt-1 text-xs text-on-accent-muted">{body}</p>
    </div>
  );
}
