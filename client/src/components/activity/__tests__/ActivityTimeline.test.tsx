import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ActivityTimeline } from '../ActivityTimeline';
import { useActivity } from '../../../hooks/useActivity';

vi.mock('../../../hooks/useActivity', () => ({ useActivity: vi.fn() }));

const mockedUseActivity = vi.mocked(useActivity);

describe('ActivityTimeline', () => {
  it('renders server-generated activity events and status metadata', () => {
    mockedUseActivity.mockReturnValue({
      isLoading: false,
      isError: false,
      isFetching: false,
      data: {
        activities: [
          {
            _id: 'activity-1',
            type: 'status-changed',
            actor: { _id: 'admin-1', name: 'Admin' },
            metadata: { fromStatus: 'under-review', toStatus: 'planned' },
            createdAt: '2026-01-01T00:00:00.000Z',
          },
          {
            _id: 'activity-2',
            type: 'comment-created',
            actor: { _id: 'user-1', name: 'Ava' },
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        meta: { page: 1, limit: 20, total: 2, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      },
    } as unknown as ReturnType<typeof useActivity>);

    render(<ActivityTimeline postId="post-1" />);

    expect(screen.getByText('Admin moved this request from Under Review to Planned')).toBeTruthy();
    expect(screen.getByText('Ava joined the discussion')).toBeTruthy();
  });

  it('renders loading, empty, and retryable error states', () => {
    mockedUseActivity.mockReturnValue({ isLoading: true } as ReturnType<typeof useActivity>);
    const { rerender } = render(<ActivityTimeline postId="post-1" />);
    expect(screen.getByLabelText('Loading activity')).toBeTruthy();

    mockedUseActivity.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        activities: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
      },
    } as unknown as ReturnType<typeof useActivity>);
    rerender(<ActivityTimeline postId="post-1" />);
    expect(screen.getByText('No activity yet')).toBeTruthy();

    mockedUseActivity.mockReturnValue({ isLoading: false, isError: true, refetch: vi.fn() } as unknown as ReturnType<typeof useActivity>);
    rerender(<ActivityTimeline postId="post-1" />);
    expect(screen.getByText('Unable to load feature activity.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });
});
