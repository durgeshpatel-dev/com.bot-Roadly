import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { PostCard } from '../PostCard';

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

vi.mock('@/hooks/useVote', () => ({
  useVote: () => ({ upvote: vi.fn(), unvote: vi.fn(), isUpvoting: false, isUnvoting: false }),
}));

describe('PostCard', () => {
  it('renders author, title, markdown preview, metadata, and counts', () => {
    render(
      <MemoryRouter>
        <PostCard post={{
          _id: 'post-1',
          title: 'Dashboard improvements',
          description: '**Make dashboards easier to scan.**',
          author: { _id: 'user-1', name: 'Ava' },
          categories: ['ui-ux'],
          status: 'planned',
          voteCount: 12,
          commentCount: 3,
          hasVoted: false,
          createdAt: '2026-01-01T00:00:00.000Z',
        }} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Ava')).toBeTruthy();
    expect(screen.getByText('Dashboard improvements')).toBeTruthy();
    expect(screen.getByText('Make dashboards easier to scan.')).toBeTruthy();
    expect(screen.getByText('Planned')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('3 comments')).toBeTruthy();
  });
});
