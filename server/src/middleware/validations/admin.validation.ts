import { z } from 'zod';
import { POST_STATUSES } from '../../constants/postStatus';

export const updatePostStatusSchema = z.object({
  status: z.enum(POST_STATUSES),
});
