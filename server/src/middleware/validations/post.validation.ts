import { z } from 'zod';
import { POST_STATUSES } from '../../constants/postStatus';

const postCategoryEnum = z.enum(['ui-ux', 'integrations', 'performance', 'general']);
const categories = z.array(postCategoryEnum).min(1, 'At least one category is required').max(4)
  .refine(value => new Set(value).size === value.length, 'Duplicate categories are not allowed');
const title = z.string().trim().min(5, 'Title must be at least 5 characters').max(150);
const description = z.string().trim().min(20, 'Description must be at least 20 characters').max(5000);

export const createPostSchema = z.object({ title, description, categories });
export const updatePostSchema = z.object({
  title: title.optional(), description: description.optional(), categories: categories.optional(),
}).refine(value => Object.keys(value).length > 0, 'At least one editable field is required');

export const paginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).refine(value => Number(value) >= 1 && Number(value) <= 1_000_000, 'Page must be between 1 and 1000000').optional(),
  limit: z.string().regex(/^\d+$/).refine(value => Number(value) >= 1 && Number(value) <= 50, 'Limit must be between 1 and 50').optional(),
});

export const getPostsQuerySchema = paginationQuerySchema.extend({
  sort: z.enum(['newest', 'most-voted', 'most-discussed']).optional(),
  category: z.string().max(100).refine(value => value.split(',').every(item => postCategoryEnum.safeParse(item).success), 'Invalid category filter').optional(),
  status: z.string().max(100).refine(value => value.split(',').every(item => z.enum(POST_STATUSES).safeParse(item).success), 'Invalid status filter').optional(),
  search: z.string().trim().max(200).optional(),
}).strict();
