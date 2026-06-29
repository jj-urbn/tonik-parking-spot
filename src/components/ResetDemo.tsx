import { useBookings } from '../store/useBookings';

export function ResetDemo() {
  const { resetDemo } = useBookings();
  return (
    <button className="text-xs text-muted underline" onClick={resetDemo}>
      Resetuj dane demo
    </button>
  );
}
