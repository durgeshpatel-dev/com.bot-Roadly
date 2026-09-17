import { useQuery } from '@tanstack/react-query';
import { getPostById } from '../api/postApi';

export const usePost = (postId: string | undefined) => useQuery({
  queryKey: ['post', postId],
  queryFn: () => getPostById(postId as string),
  enabled: Boolean(postId),
});
