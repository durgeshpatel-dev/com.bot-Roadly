import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AdminDashboard from '../AdminDashboard';
import { useAdminStats } from '../../../hooks/useAdmin';

vi.mock('../../../hooks/useAdmin', () => ({ useAdminStats: vi.fn() }));

const mockedUseAdminStats = vi.mocked(useAdminStats);

describe('AdminDashboard', () => {
  it('renders aggregate metrics, status counts, and ranked requests', () => {
    mockedUseAdminStats.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        totalPosts: 4,
        totalVotes: 16,
        totalComments: 9,
        statusCounts: { 'under-review': 1, planned: 1, 'in-progress': 1, completed: 1, rejected: 0 },
        topVoted: [{ _id: 'post-1', title: 'Dashboard request', status: 'planned', voteCount: 8, commentCount: 2 }],
        topDiscussed: [{ _id: 'post-2', title: 'Discussion request', status: 'completed', voteCount: 2, commentCount: 7 }],
      },
    } as ReturnType<typeof useAdminStats>);

    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);

    expect(screen.getByText('Total requests')).toBeTruthy();
    expect(screen.getByText('16')).toBeTruthy();
    expect(screen.getByText('Dashboard request')).toBeTruthy();
    expect(screen.getByText('Discussion request')).toBeTruthy();
    expect(screen.getByText('Top voted')).toBeTruthy();
  });

  it('renders loading and retryable error states', () => {
    mockedUseAdminStats.mockReturnValue({ isLoading: true } as ReturnType<typeof useAdminStats>);
    const { rerender } = render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    expect(screen.getByLabelText('Loading dashboard statistics')).toBeTruthy();

    mockedUseAdminStats.mockReturnValue({ isLoading: false, isError: true, refetch: vi.fn() } as unknown as ReturnType<typeof useAdminStats>);
    rerender(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    expect(screen.getByText('Unable to load dashboard statistics.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });
});
