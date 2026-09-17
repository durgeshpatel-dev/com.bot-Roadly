import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPostSchema, updatePostSchema } from '../middleware/validations/post.validation';
import { createPost, getPosts, getPostById, updatePost, deletePost, upvotePost, unvotePost } from '../controllers/post.controller';
import { getPostActivity } from '../controllers/activity.controller';

const router = Router();

// Public routes (with optional auth to detect vote state)
router.get('/', optionalAuth, getPosts);
router.get('/:id/activity', getPostActivity);
router.get('/:id', optionalAuth, getPostById);

import postCommentRoutes from './postComment.routes';
router.use('/:postId/comments', postCommentRoutes);

// Protected routes
router.use(authenticate);
router.post('/', validate(createPostSchema), createPost);
router.put('/:id', validate(updatePostSchema), updatePost);
router.delete('/:id', deletePost);

// Vote routes
router.post('/:id/vote', upvotePost);
router.delete('/:id/vote', unvotePost);

export default router;
