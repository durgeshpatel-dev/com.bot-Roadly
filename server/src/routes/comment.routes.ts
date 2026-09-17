import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateCommentSchema } from '../middleware/validations/comment.validation';
import { updateComment, deleteComment } from '../controllers/comment.controller';

const router = Router();

router.use(authenticate);
router.put('/:id', validate(updateCommentSchema), updateComment);
router.delete('/:id', deleteComment);

export default router;
