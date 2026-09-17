import apiClient from './axios';
import type { PostListMeta, PostQueryState, PostSort, PostStatus, PostSummary } from '../types/post.types';

export interface PostsResponse {
  posts: PostSummary[];
  meta: PostListMeta;
}

export interface CreatePostInput {
  title: string;
  description: string;
  categories: string[];
}

export interface PostQueryParams {
  page?: number;
  limit?: number;
  sort?: PostSort;
  category?: string[];
  status?: PostStatus[];
  search?: string;
}

const serializePostQuery = (query: PostQueryParams | PostQueryState) => ({
  page: query.page ?? 1,
  limit: query.limit ?? 10,
  sort: query.sort ?? 'newest',
  category: query.category?.length ? query.category.join(',') : undefined,
  status: query.status?.length ? query.status.join(',') : undefined,
  search: query.search?.trim() || undefined,
});

export const getPosts = async (
  query: PostQueryParams | PostQueryState,
  options?: { signal?: AbortSignal },
): Promise<PostsResponse> => {
  const response = await apiClient.get('/posts', {
    params: serializePostQuery(query),
    signal: options?.signal,
  });

  return {
    posts: response.data.data.posts,
    meta: response.data.meta,
  };
};

export const getPostById = async (postId: string): Promise<PostSummary> => {
  const response = await apiClient.get(`/posts/${postId}`);
  const { voters: _voters, ...post } = response.data.data.post;
  return post;
};

export const createPost = async (data: CreatePostInput): Promise<PostSummary> => {
  const response = await apiClient.post('/posts', data);
  return response.data.data.post;
};

export const upvotePost = async (postId: string): Promise<{ hasVoted: boolean; voteCount: number }> => {
  const response = await apiClient.post(`/posts/${postId}/vote`);
  return response.data.data;
};

export const unvotePost = async (postId: string): Promise<{ hasVoted: boolean; voteCount: number }> => {
  const response = await apiClient.delete(`/posts/${postId}/vote`);
  return response.data.data;
};
