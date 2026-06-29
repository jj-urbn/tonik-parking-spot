import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App', () => {
  beforeEach(() => localStorage.clear());

  it('shows the brand and defaults to the Reserve view (spot grid visible)', () => {
    render(<App />);
    expect(screen.getByText('Tonikowy parking')).toBeInTheDocument();
    expect(screen.getByText('Wybierz miejsce')).toBeInTheDocument();
  });

  it('switches to My reservations when its tab is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Moje rezerwacje' }));
    expect(screen.getAllByText('Ten tydzień').length).toBeGreaterThan(0);
    expect(screen.queryByText('Wybierz miejsce')).toBeNull();
  });
});
