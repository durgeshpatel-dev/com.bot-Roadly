import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPostSchema, updatePostSchema } from '../middleware/validations/post.validation';
import { createPost, getPosts, getPostById, updatePost, deletePost, upvotePost, unvotePost } from '../controllers/post.controller';
import { getPostActivity } from '../controllers/activity.controller';
import { writeLimiter, voteLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes (with optional auth to detect vote state)
router.get('/', optionalAuth, getPosts);
router.get('/:id/activity', getPostActivity);
router.get('/:id', optionalAuth, getPostById);

import postCommentRoutes from './postComment.routes';
router.use('/:postId/comments', postCommentRoutes);

// Protected routes
router.use(authenticate);
router.post('/', writeLimiter, validate(createPostSchema), createPost);
router.put('/:id', writeLimiter, validate(updatePostSchema), updatePost);
router.delete('/:id', writeLimiter, deletePost);

// Vote routes
router.post('/:id/vote', voteLimiter, upvotePost);
router.delete('/:id/vote', voteLimiter, unvotePost);

export default router;
