import { describe, expect, it, vi } from 'vitest';
import apiClient from '../axios';
import { getPostById, getPosts } from '../postApi';

vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('postApi query serialization', () => {
  it('serializes category and status arrays as comma-separated query values', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        data: { posts: [] },
        meta: { page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
      },
    } as never);

    await getPosts({
      page: 1,
      limit: 10,
      sort: 'most-voted',
      category: ['ui-ux', 'performance'],
      status: ['planned', 'in-progress'],
      search: 'dashboard',
    });

    expect(apiClient.get).toHaveBeenCalledWith('/posts', expect.objectContaining({
      params: {
        page: 1,
        limit: 10,
        sort: 'most-voted',
        category: 'ui-ux,performance',
        status: 'planned,in-progress',
        search: 'dashboard',
      },
      signal: undefined,
    }));
  });

  it('omits empty filters instead of sending arrays or bracket-style values', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { data: { posts: [] }, meta: { page: 1, limit: 10, total: 0, totalPages: 0 } },
    } as never);

    await getPosts({ page: 1, limit: 10, sort: 'newest', category: [], status: [], search: '' });

    const params = vi.mocked(apiClient.get).mock.calls.at(-1)?.[1]?.params;
    expect(params).toEqual({ page: 1, limit: 10, sort: 'newest', category: undefined, status: undefined, search: undefined });
    expect(JSON.stringify(params)).not.toContain('[]');
  });

  it('does not pass the voters array into the public detail model', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        data: {
          post: {
            _id: 'post-1',
            title: 'Feature',
            description: 'Description',
            author: { _id: 'user-1', name: 'Ava' },
            categories: ['general'],
            status: 'planned',
            voteCount: 2,
            commentCount: 1,
            hasVoted: true,
            voters: ['user-1'],
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        },
      },
    } as never);

    const post = await getPostById('post-1');
    expect(post.hasVoted).toBe(true);
    expect('voters' in post).toBe(false);
  });
});
