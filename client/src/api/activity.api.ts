import apiClient from './axios';
import type { PostStatus } from '../types/post.types';

export type ActivityEventType = 'post-created' | 'status-changed' | 'comment-created';

export interface ActivityItem {
  _id: string;
  type: ActivityEventType;
  actor: { _id: string; name: string } | null;
  metadata?: {
    fromStatus?: PostStatus;
    toStatus?: PostStatus;
  };
  createdAt: string;
}

export interface ActivityResponse {
  activities: ActivityItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const activityApi = {
  getByPost: async (postId: string, page = 1, limit = 20): Promise<ActivityResponse> => {
    const response = await apiClient.get(`/posts/${postId}/activity`, { params: { page, limit } });
    return {
      activities: response.data.data.activities,
      meta: response.data.meta,
    };
  },
};
