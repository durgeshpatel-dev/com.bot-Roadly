import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommentForm } from '@/components/comments/CommentForm';

describe('CommentForm', () => {
  it('should render the form and clear its draft after successful submission', async () => {
    const mockSubmit = vi.fn();
    render(<CommentForm onSubmit={mockSubmit} placeholder="Test placeholder" />);

    const textarea = screen.getByPlaceholderText('Test placeholder');
    const button = screen.getByRole('button', { name: /submit/i });

    expect(button.hasAttribute('disabled')).toBe(true);

    fireEvent.change(textarea, { target: { value: 'Hello world' } });
    expect(button.hasAttribute('disabled')).toBe(false);

    fireEvent.click(button);
    expect(mockSubmit).toHaveBeenCalledWith('Hello world');
    await waitFor(() => expect((textarea as HTMLTextAreaElement).value).toBe(''));
  });

  it('preserves the draft after a failed submission so it can be retried', async () => {
    const mockSubmit = vi.fn().mockRejectedValue(new Error('Network unavailable'));
    render(<CommentForm onSubmit={mockSubmit} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Keep this draft' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' }).hasAttribute('disabled')).toBe(false));
    expect((textarea as HTMLTextAreaElement).value).toBe('Keep this draft');
  });

  it('should call onCancel when cancel button is clicked', () => {
    const mockCancel = vi.fn();
    render(<CommentForm onSubmit={() => {}} onCancel={mockCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockCancel).toHaveBeenCalled();
  });
});
