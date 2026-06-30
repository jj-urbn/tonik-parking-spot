export type Tab = 'reserve' | 'mine';

const TABS: { key: Tab; label: string }[] = [
  { key: 'reserve', label: 'Zarezerwuj' },
  { key: 'mine', label: 'Moje rezerwacje' },
];

type Props = { active: Tab; onChange: (tab: Tab) => void };

export function TabSwitcher({ active, onChange }: Props) {
  return (
    <div className="sticky top-0 z-10 flex shrink-0 items-center gap-4 bg-surface p-8 text-xs">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={active === t.key ? 'font-medium text-strong' : 'text-muted'}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
