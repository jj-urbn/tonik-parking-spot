import type { ReactNode } from 'react';

export function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center shrink-0 p-8 border-b border-border">
      <h2 className="text-xs font-medium text-strong">{children}</h2>
    </div>
  );
}
