import { useBookings } from '../store/useBookings';

export function DevPanel() {
  const { resetDemo, clearAll } = useBookings();
  return (
    <div className="fixed bottom-4 left-4 flex flex-col gap-1">
      <span className="text-xs font-medium text-muted/50">DEV</span>
      <div className="flex gap-2 text-xs text-muted">
        <button className="underline" onClick={resetDemo}>Reset demo</button>
        <span>/</span>
        <button className="underline" onClick={clearAll}>Clear all</button>
      </div>
    </div>
  );
}
