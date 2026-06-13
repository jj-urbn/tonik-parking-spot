import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookingsProvider } from '../store/BookingsProvider';
import { ReserveView } from './ReserveView';

function renderView() {
  return render(
    <BookingsProvider>
      <ReserveView />
    </BookingsProvider>,
  );
}

describe('ReserveView', () => {
  beforeEach(() => localStorage.clear());

  it('renders the spot grid (01..10)', () => {
    renderView();
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('selecting a free spot reveals the booking form with a disabled button until plates entered', () => {
    renderView();
    fireEvent.click(screen.getByText('07'));
    const button = screen.getByRole('button', { name: 'Zarezerwuj' });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Blachy'), { target: { value: 'NEW123' } });
    expect(button).toBeEnabled();
  });

  it('booking a spot shows the confirmation toast', () => {
    renderView();
    fireEvent.click(screen.getByText('07'));
    fireEvent.change(screen.getByLabelText('Blachy'), { target: { value: 'NEW123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zarezerwuj' }));
    expect(screen.getByText('Rezerwacja potwierdzona')).toBeInTheDocument();
  });
});
