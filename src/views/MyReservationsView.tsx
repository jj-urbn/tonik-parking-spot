import { useMemo, useState } from 'react';
import { useBookings } from '../store/BookingsProvider';
import { formatPolishDate, reservationsLabel, isPast, type Period } from '../lib/dates';
import { filterReservations, validateBooking } from '../store/reservations';
import { ListItem } from '../components/ListItem';
import { SectionHeader } from '../components/SectionHeader';
import { ViewHeader } from '../components/ViewHeader';
import { ParkingSpotCard } from '../components/ParkingSpotCard';
import { ParkingSpotDetails } from '../components/ParkingSpotDetails';
import { AlertDialog } from '../components/AlertDialog';
import { TabSwitcher, type Tab } from '../components/TabSwitcher';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'all', label: 'Od początku' },
  { key: 'week', label: 'Ten tydzień' },
  { key: 'month', label: 'Ten miesiąc' },
  { key: 'year', label: 'Ten rok' },
];

export function MyReservationsView({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { reservations, today, edit, remove } = useBookings();
  const [period, setPeriod] = useState<Period>('week');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [personName, setPersonName] = useState('');
  const [plates, setPlates] = useState('');
  const [note, setNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const list = useMemo(
    () => filterReservations(reservations, period, today).slice().sort((a, b) => b.date.localeCompare(a.date)),
    [reservations, period, today],
  );

  const groups = useMemo(() => {
    const map = new Map<string, typeof list>();
    for (const r of list) {
      const arr = map.get(r.date) ?? [];
      arr.push(r);
      map.set(r.date, arr);
    }
    return [...map.entries()];
  }, [list]);

  const selected = list.find((r) => r.id === selectedId) ?? null;

  const detailsStatus = !selected
    ? 'none'
    : isPast(selected.date, today)
      ? 'booked'
      : 'booked-user';

  const activePeriodLabel = PERIODS.find((p) => p.key === period)?.label ?? '';

  function select(id: string) {
    const r = reservations.find((x) => x.id === id);
    if (!r) return;
    setSelectedId(id);
    setPersonName(r.personName);
    setPlates(r.plates);
    setNote(r.note);
  }

  return (
    <>
      {/* Header: col2–col3, row1 */}
      <ViewHeader label="Wybrany okres">{activePeriodLabel}</ViewHeader>

      {/* Left aside: col1, row2 */}
      <aside className="col-start-1 row-start-2 overflow-auto border-r border-border">
        <TabSwitcher active="mine" onChange={onNavigate} />
        {PERIODS.map((p) => (
          <ListItem
            key={p.key}
            label={p.label}
            trailing={reservationsLabel(filterReservations(reservations, p.key, today).length)}
            active={p.key === period}
            onSelect={() => {
              setPeriod(p.key);
              setSelectedId(null);
              setPersonName('');
              setPlates('');
              setNote('');
            }}
          />
        ))}
      </aside>

      {/* Body: col2, row2 */}
      <main className="col-start-2 row-start-2 flex flex-col overflow-auto">
        {list.length === 0 ? (
          <p className="p-8 text-center text-xs text-muted">Brak rezerwacji w tym okresie</p>
        ) : (
          groups.map(([date, items]) => (
            <section key={date}>
              <SectionHeader>{formatPolishDate(date)}</SectionHeader>
              <div className="flex flex-col gap-2 px-8 pb-8">
                {items.map((r) => (
                  <div key={r.id} className="h-[216px]">
                    <ParkingSpotCard
                      spotId={r.spotId}
                      state={selectedId === r.id ? 'selected' : 'booked'}
                      personName={r.personName}
                      onClick={() => select(r.id)}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Details aside: col3, row2 */}
      <aside aria-label="Szczegóły" className="col-start-3 row-start-2 overflow-auto border-l border-border">
        <SectionHeader>Szczegóły</SectionHeader>
        <ParkingSpotDetails
          status={detailsStatus}
          spotId={selected?.spotId}
          personName={personName}
          plates={plates}
          note={note}
          canSubmit={validateBooking({ personName, plates })}
          onChangePersonName={setPersonName}
          onChangePlates={setPlates}
          onChangeNote={setNote}
          onSubmit={() => selected && edit(selected.id, { personName, plates, note })}
          onDelete={() => setConfirmDelete(true)}
        />
      </aside>

      {/* Modals (fixed-position) */}
      <AlertDialog
        open={confirmDelete}
        title="Usunąć rezerwację?"
        body="Tej operacji nie można cofnąć."
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (selected) remove(selected.id);
          setConfirmDelete(false);
          setSelectedId(null);
          setPersonName('');
          setPlates('');
          setNote('');
        }}
      />
    </>
  );
}
