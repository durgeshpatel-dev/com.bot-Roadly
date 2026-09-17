import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { registerSchema, loginSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema } from '../middleware/validations/auth.validation';
import { validate } from '../middleware/validate';
import { trustedAuthOrigin } from '../middleware/trustedAuthOrigin';
import { registrationLimiter, loginLimiter, recoveryLimiter, tokenActionLimiter, refreshLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(trustedAuthOrigin);
router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

router.post('/register', registrationLimiter, validate(registerSchema), AuthController.register);
router.post('/verify-email', tokenActionLimiter, validate(verifyEmailSchema), AuthController.verifyEmail);
router.post('/login', loginLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', refreshLimiter, AuthController.refresh);
router.post('/forgot-password', recoveryLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', tokenActionLimiter, validate(resetPasswordSchema), AuthController.resetPassword);

// Refresh-cookie logout must also work after the access token has expired.
router.post('/logout', refreshLimiter, AuthController.logout);

export default router;
