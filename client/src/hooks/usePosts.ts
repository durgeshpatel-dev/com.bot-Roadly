import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getPosts } from '../api/postApi';
import type { PostQueryState } from '../types/post.types';

export const usePosts = (query: PostQueryState) => useQuery({
  queryKey: ['posts', query],
  queryFn: ({ signal }) => getPosts(query, { signal }),
  placeholderData: keepPreviousData,
});
