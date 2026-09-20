import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import { upvotePost, unvotePost } from '../api/postApi';
import type { PostsResponse } from '../api/postApi';
import type { PostSummary } from '../types/post.types';
import { toastManager } from '../components/ui/toast';

type VoteState = Pick<PostSummary, 'hasVoted' | 'voteCount'>;
interface VoteContext {
  lists: [QueryKey, VoteState][];
  detail?: VoteState;
}

const voteState = ({ hasVoted, voteCount }: VoteState): VoteState => ({ hasVoted, voteCount });

export const useVote = () => {
  const queryClient = useQueryClient();

  const updateLists = (postId: string, update: (post: PostSummary) => PostSummary) => {
    queryClient.setQueriesData<PostsResponse>({ queryKey: ['posts'] }, (old) => old && ({
      ...old, posts: old.posts.map((post) => post._id === postId ? update(post) : post),
    }));
  };

  const handleVote = async (postId: string, hasVoted: boolean): Promise<VoteContext> => {
    await Promise.all([
      queryClient.cancelQueries({ queryKey: ['posts'] }),
      queryClient.cancelQueries({ queryKey: ['post', postId] }),
    ]);
    const lists: VoteContext['lists'] = [];
    for (const [key, cached] of queryClient.getQueriesData<PostsResponse>({ queryKey: ['posts'] })) {
      const post = cached?.posts.find((item) => item._id === postId);
      if (post) lists.push([key, voteState(post)]);
    }
    const detail = queryClient.getQueryData<PostSummary>(['post', postId]);
    const optimistic = (post: PostSummary): PostSummary => ({
      ...post, hasVoted,
      voteCount: Math.max(0, post.voteCount + (Boolean(post.hasVoted) === hasVoted ? 0 : hasVoted ? 1 : -1)),
    });
    updateLists(postId, optimistic);
    queryClient.setQueryData<PostSummary>(['post', postId], (old) => old && optimistic(old));
    return { lists, detail: detail && voteState(detail) };
  };

  const rollback = (context: VoteContext | undefined, postId: string) => {
    // Restore only this post's vote fields, preserving other pending votes and edits.
    for (const [key, previous] of context?.lists ?? []) {
      queryClient.setQueryData<PostsResponse>(key, (old) => old && ({
        ...old, posts: old.posts.map((post) => post._id === postId ? { ...post, ...previous } : post),
      }));
    }
    if (context?.detail) {
      queryClient.setQueryData<PostSummary>(['post', postId], (old) => old && ({ ...old, ...context.detail }));
    }
    toastManager.add({ type: 'error', title: 'Vote failed. Please try again.' });
  };

  const reconcile = (postId: string, state: VoteState) => {
    updateLists(postId, (post) => ({ ...post, ...state }));
    queryClient.setQueryData<PostSummary>(['post', postId], (old) => old && ({ ...old, ...state }));
  };

  const invalidate = (postId: string) => {
    queryClient.invalidateQueries({ queryKey: ['post', postId] }).catch(() => {});
    // Refetch shared lists after the last pending vote, avoiding optimistic flicker.
    if (queryClient.isMutating({ mutationKey: ['vote'] }) === 1) {
      for (const queryKey of [['posts'], ['roadmap'], ['admin']]) queryClient.invalidateQueries({ queryKey }).catch(() => {});
    }
  };

  const upvoteMutation = useMutation({
    mutationKey: ['vote'],
    mutationFn: upvotePost,
    onMutate: (postId) => handleVote(postId, true),
    onError: (_error, postId, context) => rollback(context, postId),
    onSuccess: (state, postId) => reconcile(postId, state),
    onSettled: (_data, _error, postId) => invalidate(postId),
  });
  const unvoteMutation = useMutation({
    mutationKey: ['vote'],
    mutationFn: unvotePost,
    onMutate: (postId) => handleVote(postId, false),
    onError: (_error, postId, context) => rollback(context, postId),
    onSuccess: (state, postId) => reconcile(postId, state),
    onSettled: (_data, _error, postId) => invalidate(postId),
  });

  return {
    upvote: upvoteMutation.mutate,
    unvote: unvoteMutation.mutate,
    isUpvoting: upvoteMutation.isPending,
    isUnvoting: unvoteMutation.isPending,
  };
};
