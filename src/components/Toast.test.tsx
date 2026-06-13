import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  it('renders title and body when open', () => {
    render(<Toast open title="Rezerwacja potwierdzona" body="Twoja rezerwacja została zapisana" onDismiss={() => {}} />);
    expect(screen.getByText('Rezerwacja potwierdzona')).toBeInTheDocument();
  });
  it('renders nothing when closed', () => {
    const { container } = render(<Toast open={false} title="x" body="y" onDismiss={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
  it('calls onDismiss after 3s when open', () => {
    vi.useFakeTimers();
    try {
      const onDismiss = vi.fn();
      render(<Toast open title="t" body="b" onDismiss={onDismiss} />);
      expect(onDismiss).not.toHaveBeenCalled();
      vi.advanceTimersByTime(3000);
      expect(onDismiss).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not call onDismiss after unmount', () => {
    vi.useFakeTimers();
    try {
      const onDismiss = vi.fn();
      const { unmount } = render(<Toast open title="t" body="b" onDismiss={onDismiss} />);
      unmount();
      vi.advanceTimersByTime(3000);
      expect(onDismiss).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
