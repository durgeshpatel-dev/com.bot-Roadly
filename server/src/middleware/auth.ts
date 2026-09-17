import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models/User';
import { catchAsync } from '../utils/catchAsync';

export const authenticate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification token
  try {
    const decoded = verifyAccessToken(token);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401));
  }
});

export const optionalAuth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(); // Proceed as guest
  }

  try {
    const decoded = verifyAccessToken(token);
    const currentUser = await User.findById(decoded.userId);
    if (currentUser) {
      req.user = currentUser;
    }
  } catch (error) {
    // Ignore invalid tokens for optional routes and proceed as guest
  }
  next();
});

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('You are not logged in', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
