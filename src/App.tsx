import { useState } from 'react';
import { BookingsProvider } from './store/BookingsProvider';
import { ReserveView } from './views/ReserveView';
import { MyReservationsView } from './views/MyReservationsView';
import { ResetDemo } from './components/ResetDemo';

type Tab = 'reserve' | 'mine';

export default function App() {
  const [tab, setTab] = useState<Tab>('reserve');

  return (
    <BookingsProvider>
      <div className="grid h-full grid-cols-[302px_1fr_302px] grid-rows-[196px_1fr]">
        {/* col1, row1: brand + nav */}
        <div className="col-start-1 row-start-1 flex flex-col border-r border-b border-border p-8">
          <p className="text-xs text-muted">Tonikowy parking</p>
          <div className="mt-12 h-12 w-12 rounded-full border border-strong" aria-hidden />
          <nav className="mt-12 flex gap-4">
            <button
              className={`text-xs ${tab === 'reserve' ? 'text-strong' : 'text-muted'}`}
              onClick={() => setTab('reserve')}
            >
              Zarezerwuj
            </button>
            <button
              className={`text-xs ${tab === 'mine' ? 'text-strong' : 'text-muted'}`}
              onClick={() => setTab('mine')}
            >
              Moje rezerwacje
            </button>
          </nav>
          <div className="mt-auto">
            <ResetDemo />
          </div>
        </div>

        {tab === 'reserve' ? <ReserveView /> : <MyReservationsView />}
      </div>
    </BookingsProvider>
  );
}
