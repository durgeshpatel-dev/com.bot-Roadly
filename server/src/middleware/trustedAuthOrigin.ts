import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export const trustedAuthOrigin = (req: Request, _res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  // Cookies with SameSite=None need an explicit CSRF boundary on cookie-authenticated routes.
  if ((origin && origin !== env.CLIENT_URL) || (!origin && env.COOKIE_SAME_SITE === 'none')) {
    return next(new AppError('Untrusted request origin', 403));
  }
  next();
};
