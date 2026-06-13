type Props = {
  label: string;
  trailing?: string;
  active: boolean;
  onSelect: () => void;
};

export function ListItem({ label, trailing, active, onSelect }: Props) {
  const base = 'flex w-full items-center justify-between px-8 py-3 text-xs text-left transition-colors';
  const state = active ? 'bg-accent text-on-accent' : 'text-default hover:bg-surface-muted';
  return (
    <button className={`${base} ${state}`} onClick={onSelect}>
      <span>{label}</span>
      {trailing && (
        <span className={active ? 'text-on-accent-muted' : 'text-muted'}>{trailing}</span>
      )}
    </button>
  );
}
