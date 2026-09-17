import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protect all user routes
router.use(authenticate);

router.get('/me', UserController.getMe);

export default router;
