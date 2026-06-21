type State = 'free' | 'booked' | 'selected';

type Props = {
  spotId: string;
  state: State;
  personName?: string;
  onClick: () => void;
};

const HATCH_STYLE: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(45deg, transparent, transparent 6px, #d6d3d1 6px, #d6d3d1 7px)',
};

export function ParkingSpotCard({ spotId, state, personName, onClick }: Props) {
  const baseClass =
    state === 'selected'
      ? 'bg-accent text-on-accent'
      : state === 'booked'
        ? 'bg-surface-muted text-muted'
        : 'bg-surface text-strong hover:bg-surface-muted';

  const caption =
    state === 'selected' ? 'Wybrane' : state === 'booked' ? 'Zarezerwowane' : 'Wolne';

  return (
    <button
      onClick={onClick}
      className={`flex h-full w-full flex-col justify-between p-6 text-left transition-colors ${baseClass}`}
      style={state === 'booked' ? HATCH_STYLE : undefined}
    >
      <span className="text-4xl">{spotId}</span>
      <span className="text-xs">
        {caption}
        {state === 'booked' && personName && <span className="block">{personName}</span>}
      </span>
    </button>
  );
}
