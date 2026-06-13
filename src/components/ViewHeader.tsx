import type { ReactNode } from 'react';

type Props = { label: string; children: ReactNode };

export function ViewHeader({ label, children }: Props) {
  return (
    <header className="col-span-2 col-start-2 row-start-1 flex flex-col items-start gap-8 px-8 py-12 border-b border-border">
      <p className="text-xs text-default">{label}</p>
      <h1 className="text-5xl text-strong">{children}</h1>
    </header>
  );
}
