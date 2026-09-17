import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

const codes: Record<number, string> = {
  400: 'VALIDATION_ERROR', 401: 'UNAUTHORIZED', 403: 'FORBIDDEN', 404: 'NOT_FOUND',
  409: 'CONFLICT', 413: 'PAYLOAD_TOO_LARGE', 429: 'RATE_LIMITED', 503: 'SERVICE_UNAVAILABLE',
};

export const errorHandler = (
  error: unknown, _req: Request, res: Response, _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Something went wrong!';
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = error.issues.map(issue => issue.message).join(', ');
  } else if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Invalid request data';
  } else if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
    statusCode = 409;
    message = 'Resource already exists';
  } else if (error && typeof error === 'object' && 'type' in error) {
    if (error.type === 'entity.parse.failed') { statusCode = 400; message = 'Invalid JSON body'; }
    if (error.type === 'entity.too.large') { statusCode = 413; message = 'Request body is too large'; }
  }
  if (statusCode === 500) console.error('Request failed with an unexpected server error');
  res.status(statusCode).json({
    success: false, error: { code: codes[statusCode] ?? 'INTERNAL_SERVER_ERROR', message, statusCode },
  });
};
