import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders its label and fires onClick', () => {
    const onClick = vi.fn();
    render(<Button variant="primary" onClick={onClick}>Zapisz</Button>);
    screen.getByRole('button', { name: 'Zapisz' }).click();
    expect(onClick).toHaveBeenCalledOnce();
  });
  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button variant="primary" disabled onClick={onClick}>Zapisz</Button>);
    screen.getByRole('button', { name: 'Zapisz' }).click();
    expect(onClick).not.toHaveBeenCalled();
  });
});
