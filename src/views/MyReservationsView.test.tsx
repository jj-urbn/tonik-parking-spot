import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookingsProvider } from '../store/BookingsProvider';
import { MyReservationsView } from './MyReservationsView';
import { STORAGE_KEY } from '../store/storage';

function renderView() {
  return render(
    <BookingsProvider>
      <MyReservationsView onNavigate={() => {}} />
    </BookingsProvider>,
  );
}

describe('MyReservationsView', () => {
  beforeEach(() => localStorage.clear());

  it('shows the period filters', () => {
    renderView();
    expect(screen.getAllByText('Ten tydzień').length).toBeGreaterThan(0);
    expect(screen.getByText('Od początku')).toBeInTheDocument();
  });

  it('lists the user reservation for this week (spot 09 in seed)', () => {
    renderView();
    expect(screen.getByText('09')).toBeInTheDocument();
  });

  it('selecting a reservation shows the editable form with Zapisz and Usuń', () => {
    renderView();
    fireEvent.click(screen.getByText('09'));
    expect(screen.getByRole('button', { name: 'Zapisz' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Usuń' })).toBeInTheDocument();
  });

  it('deleting via the dialog removes the reservation', () => {
    renderView();
    fireEvent.click(screen.getByText('09'));
    fireEvent.click(screen.getByRole('button', { name: 'Usuń' }));
    const dialogConfirm = screen.getAllByRole('button', { name: 'Usuń' }).at(-1)!;
    fireEvent.click(dialogConfirm);
    expect(screen.queryByText('09')).toBeNull();
  });

  it('renders a past booking as read-only (no Zapisz/Usuń)', () => {
    renderView();
    fireEvent.click(screen.getByText('Od początku')); // always includes past spot 02
    fireEvent.click(screen.getByText('02'));
    expect(screen.queryByRole('button', { name: 'Zapisz' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Usuń' })).toBeNull();
  });

  it('shows an empty state when the period has no reservations', () => {
    localStorage.setItem(STORAGE_KEY, '[]');
    renderView();
    expect(screen.getByText('Brak rezerwacji w tym okresie')).toBeInTheDocument();
  });
});
