import { useMemo, useState } from 'react';
import { useBookings } from '../store/BookingsProvider';
import { SPOT_IDS, CURRENT_USER } from '../lib/constants';
import { rollingDays, formatPolishDate, spotsLabel } from '../lib/dates';
import { spotStatus, freeCountForDay, validateBooking } from '../store/reservations';
import { ListItem } from '../components/ListItem';
import { ParkingSpotCard } from '../components/ParkingSpotCard';
import { ParkingSpotDetails } from '../components/ParkingSpotDetails';
import { Toast } from '../components/Toast';
import { AlertDialog } from '../components/AlertDialog';

export function ReserveView() {
  const { reservations, today, book, edit, remove } = useBookings();
  const days = useMemo(() => rollingDays(today, 8), [today]);

  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [personName, setPersonName] = useState(CURRENT_USER);
  const [plates, setPlates] = useState('');
  const [note, setNote] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const status = selectedSpotId ? spotStatus(reservations, selectedSpotId, selectedDate) : null;

  function selectDay(date: string) {
    setSelectedDate(date);
    setSelectedSpotId(null);
    setConfirmDelete(false);
  }

  function selectSpot(spotId: string) {
    setSelectedSpotId(spotId);
    const s = spotStatus(reservations, spotId, selectedDate);
    if (s.kind === 'booked') {
      setPersonName(s.reservation.personName);
      setPlates(s.reservation.plates);
      setNote(s.reservation.note);
    } else {
      setPersonName(CURRENT_USER);
      setPlates('');
      setNote('');
    }
  }

  function clearSelection() {
    setSelectedSpotId(null);
    setPersonName(CURRENT_USER);
    setPlates('');
    setNote('');
  }

  function handleSubmit() {
    if (!selectedSpotId) return;
    if (status?.kind === 'booked' && status.byCurrentUser) {
      edit(status.reservation.id, { personName, plates, note });
    } else {
      book({ spotId: selectedSpotId, date: selectedDate, personName, plates, note });
      setToastOpen(true);
    }
    clearSelection();
  }

  const detailsStatus =
    !selectedSpotId || !status
      ? 'none'
      : status.kind === 'free'
        ? 'available'
        : status.byCurrentUser
          ? 'booked-user'
          : 'booked';

  return (
    <>
      {/* Header: col2–col3, row1 */}
      <header className="col-span-2 col-start-2 row-start-1 flex flex-col justify-center border-b border-border px-8">
        <p className="text-xs text-muted">Wybrany dzień</p>
        <h1 className="text-5xl text-strong">{formatPolishDate(selectedDate)}</h1>
      </header>

      {/* Left aside: col1, row2 */}
      <aside className="col-start-1 row-start-2 overflow-auto border-r border-border">
        <div className="px-8 py-6 text-xs text-muted">Wybierz dzień</div>
        {days.map((d) => (
          <ListItem
            key={d}
            label={formatPolishDate(d)}
            trailing={spotsLabel(freeCountForDay(reservations, d))}
            active={d === selectedDate}
            onSelect={() => selectDay(d)}
          />
        ))}
      </aside>

      {/* Body: col2, row2 */}
      <main className="col-start-2 row-start-2 overflow-auto">
        <div className="grid grid-cols-5 gap-0 px-8 pt-8">
          {SPOT_IDS.map((id) => {
            const s = spotStatus(reservations, id, selectedDate);
            const state =
              selectedSpotId === id
                ? 'selected'
                : s.kind === 'booked'
                  ? 'booked'
                  : 'free';
            return (
              <div key={id} className="h-[216px]">
                <ParkingSpotCard
                  spotId={id}
                  state={state}
                  personName={s.kind === 'booked' ? s.reservation.personName : undefined}
                  onClick={() => selectSpot(id)}
                />
              </div>
            );
          })}
        </div>
      </main>

      {/* Details aside: col3, row2 */}
      <aside className="col-start-3 row-start-2 overflow-auto border-l border-border">
        <div className="px-8 py-6 text-xs text-muted">Szczegóły</div>
        <ParkingSpotDetails
          status={detailsStatus}
          spotId={selectedSpotId ?? undefined}
          personName={personName}
          plates={plates}
          note={note}
          canSubmit={validateBooking({ personName, plates })}
          onChangePersonName={setPersonName}
          onChangePlates={setPlates}
          onChangeNote={setNote}
          onSubmit={handleSubmit}
          onDelete={() => setConfirmDelete(true)}
        />
      </aside>

      {/* Modals (fixed-position) */}
      <Toast
        open={toastOpen}
        title="Rezerwacja potwierdzona"
        body="Twoja rezerwacja została zapisana i jest widoczna dla innych"
        onDismiss={() => setToastOpen(false)}
      />

      <AlertDialog
        open={confirmDelete}
        title="Usunąć rezerwację?"
        body="Tej operacji nie można cofnąć."
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (status?.kind === 'booked') remove(status.reservation.id);
          setConfirmDelete(false);
          clearSelection();
        }}
      />
    </>
  );
}
