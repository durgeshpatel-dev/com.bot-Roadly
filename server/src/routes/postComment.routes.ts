import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCommentSchema } from '../middleware/validations/comment.validation';
import { writeLimiter } from '../middleware/rateLimiter';
import { createComment, getComments } from '../controllers/comment.controller';

const router = Router({ mergeParams: true });

router.get('/', getComments);

router.use(authenticate);
router.post('/', writeLimiter, validate(createCommentSchema), createComment);

export default router;
