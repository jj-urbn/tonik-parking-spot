import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InfoField } from './InfoField';

describe('InfoField', () => {
  it('renders an editable input and reports changes', () => {
    const onChange = vi.fn();
    render(<InfoField label="Blachy" required value="" onChange={onChange} />);
    expect(screen.getByText('Blachy')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Blachy'), { target: { value: 'PY4922H' } });
    expect(onChange).toHaveBeenCalledWith('PY4922H');
  });
  it('renders read-only value as static text (no input)', () => {
    render(<InfoField label="Miejsce" readOnly value="09" />);
    expect(screen.getByText('09')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).toBeNull();
  });
});
