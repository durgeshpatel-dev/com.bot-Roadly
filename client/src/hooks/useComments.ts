import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '../api/commentApi';
import { toastManager } from '../components/ui/toast';

export const useComments = (postId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['comments', postId];
  const postQueryKey = ['post', postId]; // Also invalidate post to update commentCount
  const postsQueryKey = ['posts']; // And feed

  const commentsQuery = useQuery({
    queryKey,
    queryFn: () => commentApi.getComments(postId),
  });

  const createMutation = useMutation({
    mutationFn: (data: { content: string; parentComment?: string | null }) =>
      commentApi.createComment({ postId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: postQueryKey });
      queryClient.invalidateQueries({ queryKey: postsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['activity', postId] });
      toastManager.add({ type: 'success', title: 'Comment added' });
    },
    onError: (error: any) => {
      toastManager.add({ type: 'error', title: error.response?.data?.error?.message || 'Failed to add comment' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { commentId: string; content: string }) =>
      commentApi.updateComment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toastManager.add({ type: 'success', title: 'Comment updated' });
    },
    onError: (error: any) => {
      toastManager.add({ type: 'error', title: error.response?.data?.error?.message || 'Failed to update comment' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => commentApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: postQueryKey });
      queryClient.invalidateQueries({ queryKey: postsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['activity', postId] });
      toastManager.add({ type: 'success', title: 'Comment deleted' });
    },
    onError: (error: any) => {
      toastManager.add({ type: 'error', title: error.response?.data?.error?.message || 'Failed to delete comment' });
    },
  });

  return {
    comments: commentsQuery.data?.comments || [],
    meta: commentsQuery.data?.meta,
    isLoading: commentsQuery.isLoading,
    isError: commentsQuery.isError,
    createComment: createMutation.mutate,
    updateComment: updateMutation.mutate,
    deleteComment: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
