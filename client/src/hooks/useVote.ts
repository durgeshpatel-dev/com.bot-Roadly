import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upvotePost, unvotePost } from '../api/postApi';

interface VoteContext {
  previousPostsQueries: [any, any][];
  previousPostDetail: any;
}

export const useVote = () => {
  const queryClient = useQueryClient();

  const handleVote = async (postId: string, action: 'upvote' | 'unvote'): Promise<VoteContext> => {
    // Cancel any outgoing refetches so they don't overwrite our optimistic update
    await queryClient.cancelQueries({ queryKey: ['posts'] });
    await queryClient.cancelQueries({ queryKey: ['post', postId] });

    // Snapshot previous values
    const previousPostsQueries = queryClient.getQueriesData({ queryKey: ['posts'] });
    const previousPostDetail = queryClient.getQueryData(['post', postId]);

    // Optimistically update post list queries
    queryClient.setQueriesData({ queryKey: ['posts'] }, (old: any) => {
      if (!old || !old.posts) return old;
      return {
        ...old,
        posts: old.posts.map((post: any) => {
          if (post._id === postId) {
            return {
              ...post,
              hasVoted: action === 'upvote',
              voteCount: post.voteCount + (action === 'upvote' ? 1 : -1),
            };
          }
          return post;
        }),
      };
    });

    // Optimistically update single post query
    if (previousPostDetail) {
      queryClient.setQueryData(['post', postId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          hasVoted: action === 'upvote',
          voteCount: old.voteCount + (action === 'upvote' ? 1 : -1),
        };
      });
    }

    return { previousPostsQueries, previousPostDetail };
  };

  const rollback = (context: VoteContext | undefined, postId: string) => {
    if (context?.previousPostsQueries) {
      context.previousPostsQueries.forEach(([queryKey, queryData]) => {
        queryClient.setQueryData(queryKey, queryData);
      });
    }
    if (context?.previousPostDetail) {
      queryClient.setQueryData(['post', postId], context.previousPostDetail);
    }
  };

  const invalidate = (postId: string) => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    queryClient.invalidateQueries({ queryKey: ['post', postId] });
  };

  const upvoteMutation = useMutation({
    mutationFn: (postId: string) => upvotePost(postId),
    onMutate: async (postId) => handleVote(postId, 'upvote'),
    onError: (_err, postId, context) => rollback(context, postId),
    onSettled: (_data, _err, postId) => invalidate(postId),
  });

  const unvoteMutation = useMutation({
    mutationFn: (postId: string) => unvotePost(postId),
    onMutate: async (postId) => handleVote(postId, 'unvote'),
    onError: (_err, postId, context) => rollback(context, postId),
    onSettled: (_data, _err, postId) => invalidate(postId),
  });

  return {
    upvote: upvoteMutation.mutate,
    unvote: unvoteMutation.mutate,
    isUpvoting: upvoteMutation.isPending,
    isUnvoting: unvoteMutation.isPending,
  };
};
