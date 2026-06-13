import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: 'primary' | 'secondary';
  children: ReactNode;
};

export function Button({ variant, children, className = '', ...rest }: Props) {
  const base =
    'inline-flex items-center justify-center px-6 py-3 text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const styles =
    variant === 'primary'
      ? 'bg-accent text-on-accent hover:bg-strong'
      : 'bg-surface text-strong border border-border hover:bg-surface-muted';
  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}
