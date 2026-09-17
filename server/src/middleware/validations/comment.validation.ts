import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, 'Content is required').max(2000, 'Content must not exceed 2000 characters'),
  parentComment: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent comment ID').optional().nullable(),
});

export const updateCommentSchema = z.object({
  content: z.string().trim().min(1, 'Content is required').max(2000, 'Content must not exceed 2000 characters'),
});
