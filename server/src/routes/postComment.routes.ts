import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCommentSchema, getCommentsQuerySchema } from '../middleware/validations/comment.validation';
import { createComment, getComments } from '../controllers/comment.controller';

const router = Router({ mergeParams: true });

router.get('/', getComments);

router.use(authenticate);
router.post('/', validate(createCommentSchema), createComment);

export default router;
