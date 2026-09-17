import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { activityApi } from '../api/activity.api';

export const useActivity = (postId: string | undefined, page = 1) => useQuery({
  queryKey: ['activity', postId, page],
  queryFn: () => activityApi.getByPost(postId as string, page),
  enabled: Boolean(postId),
  placeholderData: keepPreviousData,
});
