import { z } from 'zod';

const postCategoryEnum = z.enum(['ui-ux', 'integrations', 'performance', 'general']);
const postStatusEnum = z.enum(['under-review', 'planned', 'in-progress', 'completed']);

export const createPostSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000, 'Description cannot exceed 5000 characters'),
  categories: z.array(postCategoryEnum).min(1, 'At least one category is required'),
});

export const updatePostSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(150, 'Title cannot exceed 150 characters').optional(),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000, 'Description cannot exceed 5000 characters').optional(),
  categories: z.array(postCategoryEnum).min(1, 'At least one category is required').optional(),
});

export const getPostsQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform((val) => Number(val)).optional(),
    limit: z.string().regex(/^\d+$/).transform((val) => Number(val)).optional(),
    sort: z.enum(['newest', 'most-voted', 'most-discussed']).optional().default('newest'),
    category: z.string().optional(),
    status: z.string().optional(),
    search: z.string().optional(),
  }),
});
