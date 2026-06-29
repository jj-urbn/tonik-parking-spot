import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabSwitcher } from './TabSwitcher';

describe('TabSwitcher', () => {
  it('renders both tabs', () => {
    render(<TabSwitcher active="reserve" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Zarezerwuj' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Moje rezerwacje' })).toBeInTheDocument();
  });

  it('marks the active tab as strong', () => {
    render(<TabSwitcher active="mine" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Moje rezerwacje' }).className).toContain('text-strong');
    expect(screen.getByRole('button', { name: 'Zarezerwuj' }).className).toContain('text-muted');
  });

  it('fires onChange with the clicked tab key', () => {
    const onChange = vi.fn();
    render(<TabSwitcher active="reserve" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Moje rezerwacje' }));
    expect(onChange).toHaveBeenCalledWith('mine');
  });
});
