import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { BookingsProvider } from './BookingsProvider';
import { useBookings } from './useBookings';
import { STORAGE_KEY } from './storage';

function Probe() {
  const { reservations, book } = useBookings();
  return (
    <div>
      <span data-testid="count">{reservations.length}</span>
      <button onClick={() => book({ spotId: '07', date: '2026-06-05', personName: 'A', plates: 'B', note: '' })}>
        book
      </button>
    </div>
  );
}

describe('BookingsProvider', () => {
  beforeEach(() => localStorage.clear());

  it('seeds on first render and persists a new booking', () => {
    render(
      <BookingsProvider>
        <Probe />
      </BookingsProvider>,
    );
    const before = Number(screen.getByTestId('count').textContent);
    expect(before).toBeGreaterThan(0);

    act(() => {
      screen.getByText('book').click();
    });
    expect(Number(screen.getByTestId('count').textContent)).toBe(before + 1);
    expect(localStorage.getItem(STORAGE_KEY)).toContain('07');
  });

  it('throws when useBookings is used outside the provider', () => {
    function Orphan() {
      useBookings();
      return null;
    }
    // Suppress the expected React error boundary console noise.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Orphan />)).toThrow(/useBookings must be used within BookingsProvider/);
    spy.mockRestore();
  });
});
