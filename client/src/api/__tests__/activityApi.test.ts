import { describe, expect, it, vi } from 'vitest';
import apiClient from '../axios';
import { activityApi } from '../activity.api';

vi.mock('../axios', () => ({
  default: { get: vi.fn() },
}));

describe('activityApi', () => {
  it('uses the paginated public activity endpoint and parses the response envelope', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        data: { activities: [{ _id: 'activity-1', type: 'post-created', actor: null, createdAt: '2026-01-01T00:00:00.000Z' }] },
        meta: { page: 2, limit: 20, total: 21, totalPages: 2, hasNextPage: false, hasPrevPage: true },
      },
    } as never);

    const response = await activityApi.getByPost('post-1', 2, 20);

    expect(apiClient.get).toHaveBeenCalledWith('/posts/post-1/activity', { params: { page: 2, limit: 20 } });
    expect(response.activities).toHaveLength(1);
    expect(response.meta.page).toBe(2);
  });
});
