import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlertDialog } from './AlertDialog';

describe('AlertDialog', () => {
  it('fires onConfirm and onCancel', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <AlertDialog
        open
        title="Usunąć rezerwację?"
        body="Tej operacji nie można cofnąć."
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    screen.getByRole('button', { name: 'Usuń' }).click();
    screen.getByRole('button', { name: 'Anuluj' }).click();
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });
  it('renders nothing when closed', () => {
    const { container } = render(
      <AlertDialog open={false} title="x" body="y" confirmLabel="a" cancelLabel="b" onConfirm={() => {}} onCancel={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
