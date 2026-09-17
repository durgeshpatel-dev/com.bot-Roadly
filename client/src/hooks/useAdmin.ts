import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import type { AdminPostFilters, PostStatus } from '../types/post.types';
import type { AdminStats } from '../types/admin.types';
import { toastManager } from '../components/ui/toast';

export const useAdminPosts = (filters: AdminPostFilters = {}) =>
  useQuery({
    queryKey: ['admin', 'posts', filters],
    queryFn: () => adminApi.getPosts(filters),
  });

export const useAdminStats = () => useQuery<AdminStats>({
  queryKey: ['admin', 'stats'],
  queryFn: adminApi.getStats,
});

export const useUpdatePostStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, status }: { postId: string; status: PostStatus }) =>
      adminApi.updatePostStatus(postId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      toastManager.add({ type: 'success', title: 'Status updated' });
    },
    onError: (error: any) => {
      toastManager.add({
        type: 'error',
        title: error.response?.data?.error?.message || 'Failed to update status',
      });
    },
  });
};
