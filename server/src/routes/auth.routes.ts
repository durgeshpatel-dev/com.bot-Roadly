import { Router } from 'express';
import { AuthController, registerSchema, loginSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/verify-email', validate(verifyEmailSchema), AuthController.verifyEmail);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);

export default router;
