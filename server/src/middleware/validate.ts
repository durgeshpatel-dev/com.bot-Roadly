import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format zod errors into a generic validation error message
        const errors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        next(new AppError(`Validation Error: ${errors}`, 400));
      } else {
        next(error);
      }
    }
  };
};
