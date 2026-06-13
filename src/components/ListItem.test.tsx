import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListItem } from './ListItem';

describe('ListItem', () => {
  it('renders label and trailing text and fires onSelect', () => {
    const onSelect = vi.fn();
    render(<ListItem label="Piątek, 3 kwietnia" trailing="2 miejsca" active={false} onSelect={onSelect} />);
    expect(screen.getByText('Piątek, 3 kwietnia')).toBeInTheDocument();
    expect(screen.getByText('2 miejsca')).toBeInTheDocument();
    screen.getByText('Piątek, 3 kwietnia').click();
    expect(onSelect).toHaveBeenCalledOnce();
  });
  it('applies active styling classes when active', () => {
    const { container } = render(<ListItem label="X" active onSelect={() => {}} />);
    expect(container.querySelector('button')?.className).toContain('bg-accent');
  });
});
