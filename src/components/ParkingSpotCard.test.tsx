import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ParkingSpotCard } from './ParkingSpotCard';

describe('ParkingSpotCard', () => {
  it('shows Wolne for a free spot and is clickable', () => {
    const onClick = vi.fn();
    render(<ParkingSpotCard spotId="07" state="free" onClick={onClick} />);
    expect(screen.getByText('07')).toBeInTheDocument();
    expect(screen.getByText('Wolne')).toBeInTheDocument();
    screen.getByText('07').click();
    expect(onClick).toHaveBeenCalledOnce();
  });
  it('shows Zarezerwowane and the person name for a booked spot', () => {
    render(<ParkingSpotCard spotId="01" state="booked" personName="Robert" onClick={() => {}} />);
    expect(screen.getByText('Zarezerwowane')).toBeInTheDocument();
    expect(screen.getByText('Robert')).toBeInTheDocument();
  });
  it('shows Wybrane when selected', () => {
    render(<ParkingSpotCard spotId="09" state="selected" onClick={() => {}} />);
    expect(screen.getByText('Wybrane')).toBeInTheDocument();
  });
  it('renders Zarezerwowane without a name when personName is omitted', () => {
    render(<ParkingSpotCard spotId="05" state="booked" onClick={() => {}} />);
    expect(screen.getByText('Zarezerwowane')).toBeInTheDocument();
  });
});
