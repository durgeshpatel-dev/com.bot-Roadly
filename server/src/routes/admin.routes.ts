import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updatePostStatusSchema } from '../middleware/validations/admin.validation';
import { getAdminPosts, getAdminStats, updatePostStatus } from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, authorize('admin'));
router.get('/stats', getAdminStats);
router.get('/posts', getAdminPosts);
router.patch('/posts/:id/status', validate(updatePostStatusSchema), updatePostStatus);

export default router;
