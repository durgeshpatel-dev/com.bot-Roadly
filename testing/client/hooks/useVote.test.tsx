import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useVote } from '@/hooks/useVote';
import { upvotePost, unvotePost } from '@/api/postApi';
import type { PostsResponse } from '@/api/postApi';
import type { PostSummary } from '@/types/post.types';
import { toastManager } from '@/components/ui/toast';

vi.mock('@/api/postApi', () => ({ upvotePost: vi.fn(), unvotePost: vi.fn() }));
vi.mock('@/components/ui/toast', () => ({ toastManager: { add: vi.fn() } }));
const post = (id: string): PostSummary => ({ _id: id, title: 'Request', description: 'A request description', categories: ['general'], status: 'planned', author: { _id: 'user', name: 'User' }, voteCount: 4, commentCount: 0, hasVoted: false, createdAt: '2026-09-17' });
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}
function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const key = ['posts', { page: 1 }];
  client.setQueryData(key, { posts: [post('one'), post('two')], meta: { page: 1, limit: 10, total: 2, totalPages: 1 } });
  client.setQueryData(['post', 'one'], post('one'));
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const list = () => client.getQueryData<PostsResponse>(key)!.posts;
  return { ...renderHook(useVote, { wrapper }), client, key, list };
}

describe('optimistic votes', () => {
  beforeEach(() => vi.resetAllMocks());

  it('updates list/detail immediately and reconciles the authoritative server count', async () => {
    const pending = deferred<{ hasVoted: boolean; voteCount: number }>();
    vi.mocked(upvotePost).mockReturnValue(pending.promise);
    const { result, list, client } = setup();
    act(() => result.current.upvote('one'));
    await waitFor(() => expect(list()[0]).toMatchObject({ hasVoted: true, voteCount: 5 }));
    expect(client.getQueryData(['post', 'one'])).toMatchObject({ hasVoted: true, voteCount: 5 });
    pending.resolve({ hasVoted: true, voteCount: 9 });
    await waitFor(() => expect(result.current.isUpvoting).toBe(false));
    expect(list()[0].voteCount).toBe(9);
    expect(client.getQueryData(['post', 'one'])).toMatchObject({ voteCount: 9 });
  });

  it('rolls back only the failed post while preserving another pending vote and changed comment count', async () => {
    const first = deferred<{ hasVoted: boolean; voteCount: number }>();
    const second = deferred<{ hasVoted: boolean; voteCount: number }>();
    vi.mocked(upvotePost).mockImplementation((id) => id === 'one' ? first.promise : second.promise);
    const { result, list, client, key } = setup();
    act(() => result.current.upvote('one'));
    await waitFor(() => expect(list()[0].voteCount).toBe(5));
    act(() => result.current.upvote('two'));
    await waitFor(() => expect(list()[1].voteCount).toBe(5));
    client.setQueryData<PostsResponse>(key, (old) => ({ ...old!, posts: old!.posts.map((item) => ({ ...item, commentCount: 3 })) }));
    first.reject(new Error('Network failure'));
    await waitFor(() => expect(list()[0].voteCount).toBe(4));
    expect(list()[1]).toMatchObject({ hasVoted: true, voteCount: 5 });
    expect(list()[0].commentCount).toBe(3);
    expect(toastManager.add).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    second.resolve({ hasVoted: true, voteCount: 5 });
    await waitFor(() => expect(result.current.isUpvoting).toBe(false));
  });

  it('never optimistically decrements below zero and rolls back an unvote failure', async () => {
    const pending = deferred<{ hasVoted: boolean; voteCount: number }>();
    vi.mocked(unvotePost).mockReturnValue(pending.promise);
    const { result, client, list, key } = setup();
    client.setQueryData<PostsResponse>(key, (old) => ({ ...old!, posts: [{ ...post('one'), voteCount: 0, hasVoted: true }] }));
    act(() => result.current.unvote('one'));
    await waitFor(() => expect(list()[0].hasVoted).toBe(false));
    expect(list()[0].voteCount).toBe(0);
    pending.reject(new Error('Network failure'));
    await waitFor(() => expect(result.current.isUnvoting).toBe(false));
    expect(list()[0]).toMatchObject({ voteCount: 0, hasVoted: true });
  });
});
