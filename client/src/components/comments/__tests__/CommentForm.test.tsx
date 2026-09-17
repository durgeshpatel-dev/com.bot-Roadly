import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommentForm } from '../CommentForm';

describe('CommentForm', () => {
  it('should render the form and submit if content is provided', () => {
    const mockSubmit = vi.fn();
    render(<CommentForm onSubmit={mockSubmit} placeholder="Test placeholder" />);

    const textarea = screen.getByPlaceholderText('Test placeholder');
    const button = screen.getByRole('button', { name: /submit/i });

    expect(button.hasAttribute('disabled')).toBe(true);

    fireEvent.change(textarea, { target: { value: 'Hello world' } });
    expect(button.hasAttribute('disabled')).toBe(false);

    fireEvent.click(button);
    expect(mockSubmit).toHaveBeenCalledWith('Hello world');
  });

  it('should call onCancel when cancel button is clicked', () => {
    const mockCancel = vi.fn();
    render(<CommentForm onSubmit={() => {}} onCancel={mockCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockCancel).toHaveBeenCalled();
  });
});
