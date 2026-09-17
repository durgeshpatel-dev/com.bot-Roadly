import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models/User';
import { catchAsync } from '../utils/catchAsync';

const readIdentity = async (authorization?: string) => {
  const match = authorization?.match(/^Bearer ([^\s]+)$/);
  if (!match) throw new AppError('Please log in to get access.', 401);
  const decoded = verifyAccessToken(match[1]);
  const user = await User.findById(decoded.userId).select('+authVersion');
  if (!user || (decoded.authVersion ?? 0) !== (user.authVersion ?? 0)) {
    throw new AppError('Invalid or expired token', 401);
  }
  return user;
};

export const authenticate = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  req.user = await readIdentity(req.headers.authorization);
  next();
});

export const optionalAuth = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    try {
      req.user = await readIdentity(req.headers.authorization);
    } catch (error) {
      if (!(error instanceof AppError)) throw error;
      // Public reads remain available when a browser has a stale access token.
    }
  }
  next();
});

export const authorize = (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('You are not logged in', 401));
    if (!roles.includes(req.user.role)) return next(new AppError('You do not have permission to perform this action', 403));
    next();
  };
