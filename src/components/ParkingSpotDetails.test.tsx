import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ParkingSpotDetails } from './ParkingSpotDetails';

const baseProps = {
  personName: '', plates: '', note: '', canSubmit: false,
  onChangePersonName: () => {}, onChangePlates: () => {}, onChangeNote: () => {},
  onSubmit: () => {},
};

describe('ParkingSpotDetails', () => {
  it('shows the empty prompt for status none', () => {
    render(<ParkingSpotDetails status="none" {...baseProps} />);
    expect(screen.getByText(/Wybierz miejsce/)).toBeInTheDocument();
  });
  it('shows a Zarezerwuj button for available', () => {
    render(<ParkingSpotDetails status="available" spotId="07" {...baseProps} canSubmit />);
    expect(screen.getByRole('button', { name: 'Zarezerwuj' })).toBeEnabled();
  });
  it('disables submit when canSubmit is false', () => {
    render(<ParkingSpotDetails status="available" spotId="07" {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Zarezerwuj' })).toBeDisabled();
  });
  it('shows Zapisz and Usuń for booked-user', () => {
    const onDelete = vi.fn();
    render(<ParkingSpotDetails status="booked-user" spotId="09" {...baseProps} canSubmit onDelete={onDelete} />);
    expect(screen.getByRole('button', { name: 'Zapisz' })).toBeInTheDocument();
    screen.getByRole('button', { name: 'Usuń' }).click();
    expect(onDelete).toHaveBeenCalledOnce();
  });
  it('renders read-only details for booked (someone else)', () => {
    render(<ParkingSpotDetails status="booked" spotId="01" {...baseProps} personName="Anna Nowak" plates="WX1234A" />);
    expect(screen.getByText('Anna Nowak')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Zarezerwuj' })).toBeNull();
  });
});
