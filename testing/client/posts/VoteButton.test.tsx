import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VoteButton } from '@/components/posts/VoteButton';
import { useAuth } from '@/context/AuthContext';
import { useVote } from '@/hooks/useVote';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useVote', () => ({
  useVote: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('VoteButton', () => {
  const mockNavigate = vi.fn();
  const mockUpvote = vi.fn();
  const mockUnvote = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    (useVote as any).mockReturnValue({
      upvote: mockUpvote,
      unvote: mockUnvote,
      isUpvoting: false,
      isUnvoting: false,
    });
  });

  it('shows an authentication prompt when unauthenticated user clicks', () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: false });

    render(<VoteButton postId="123" voteCount={10} hasVoted={false} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Sign in to participate')).toBeTruthy();
    expect(mockUpvote).not.toHaveBeenCalled();
  });

  it('calls upvote when authenticated user clicks and has not voted', () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: true });

    render(<VoteButton postId="123" voteCount={10} hasVoted={false} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockUpvote).toHaveBeenCalledWith('123');
    expect(mockUnvote).not.toHaveBeenCalled();
  });

  it('calls unvote when authenticated user clicks and has already voted', () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: true });

    render(<VoteButton postId="123" voteCount={11} hasVoted={true} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockUnvote).toHaveBeenCalledWith('123');
    expect(mockUpvote).not.toHaveBeenCalled();
  });

  it('is disabled when loading (isUpvoting or isUnvoting)', () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: true });
    (useVote as any).mockReturnValue({
      upvote: mockUpvote,
      unvote: mockUnvote,
      isUpvoting: true,
      isUnvoting: false,
    });

    render(<VoteButton postId="123" voteCount={10} hasVoted={false} />);
    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBe(true);
  });
});
