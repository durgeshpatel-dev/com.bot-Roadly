import { rateLimit } from 'express-rate-limit';

const createLimiter = (limit: number) => rateLimit({
  windowMs: 15 * 60 * 1000,
  limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.', statusCode: 429 },
  },
});

export const registrationLimiter = createLimiter(5);
export const loginLimiter = createLimiter(10);
export const recoveryLimiter = createLimiter(3);
export const tokenActionLimiter = createLimiter(10);
export const refreshLimiter = createLimiter(120);
export const writeLimiter = createLimiter(120);
export const voteLimiter = createLimiter(120);
