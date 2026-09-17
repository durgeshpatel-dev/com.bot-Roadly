import apiClient from './axios';
import type {
  AdminPost,
  AdminPostFilters,
  PostListMeta,
  PostStatus,
} from '../types/post.types';

export interface AdminPostsResponse {
  posts: AdminPost[];
  meta: PostListMeta;
}

export const adminApi = {
  getPosts: async (filters: AdminPostFilters = {}): Promise<AdminPostsResponse> => {
    const response = await apiClient.get('/admin/posts', { params: filters });
    return {
      posts: response.data.data.posts,
      meta: response.data.meta,
    };
  },

  updatePostStatus: async (postId: string, status: PostStatus) => {
    const response = await apiClient.patch(`/admin/posts/${postId}/status`, { status });
    return response.data.data.post as Pick<AdminPost, '_id' | 'status' | 'updatedAt'>;
  },
};
