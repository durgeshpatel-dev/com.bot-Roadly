import { describe, expect, it, vi } from 'vitest';
import apiClient from '../axios';
import { adminApi } from '../admin.api';

vi.mock('../axios', () => ({
  default: { get: vi.fn(), patch: vi.fn() },
}));

describe('adminApi', () => {
  it('parses the admin stats response without a voters field', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        data: {
          stats: {
            totalPosts: 1,
            totalVotes: 3,
            totalComments: 2,
            statusCounts: { 'under-review': 0, planned: 1, 'in-progress': 0, completed: 0, rejected: 0 },
            topVoted: [{ _id: 'post-1', title: 'Request', status: 'planned', voteCount: 3, commentCount: 2 }],
            topDiscussed: [{ _id: 'post-1', title: 'Request', status: 'planned', voteCount: 3, commentCount: 2 }],
          },
        },
      },
    } as never);

    const stats = await adminApi.getStats();

    expect(apiClient.get).toHaveBeenCalledWith('/admin/stats');
    expect(stats.totalPosts).toBe(1);
    expect(stats.topVoted[0]).not.toHaveProperty('voters');
  });
});
