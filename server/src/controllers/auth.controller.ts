import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/response';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Helper for cookie options
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export class AuthController {
  static register = catchAsync(async (req: Request, res: Response) => {
    const user = await AuthService.register(req.body);
    sendSuccess(res, 201, {
      user,
      message: 'Registration successful. Please verify your email.',
    });
  });

  static verifyEmail = catchAsync(async (req: Request, res: Response) => {
    await AuthService.verifyEmail(req.body.token);
    sendSuccess(res, 200, {
      message: 'Email verified successfully.',
    });
  });

  static login = catchAsync(async (req: Request, res: Response) => {
    const { user, accessToken, refreshTokenString } = await AuthService.login(req.body);

    res.cookie('refreshToken', refreshTokenString, getCookieOptions());

    sendSuccess(res, 200, {
      user,
      accessToken,
    });
  });

  static refresh = catchAsync(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'No refresh token found',
        },
      });
    }

    const { accessToken, refreshTokenString } = await AuthService.refresh(token);

    res.cookie('refreshToken', refreshTokenString, getCookieOptions());

    sendSuccess(res, 200, {
      accessToken,
    });
  });

  static logout = catchAsync(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (token) {
      await AuthService.logout(token);
    }
    
    res.clearCookie('refreshToken', getCookieOptions());
    
    sendSuccess(res, 200, {
      message: 'Logged out successfully.',
    });
  });

  static forgotPassword = catchAsync(async (req: Request, res: Response) => {
    await AuthService.forgotPassword(req.body.email);
    sendSuccess(res, 200, {
      message: 'If this email exists, a password reset link has been sent.',
    });
  });

  static resetPassword = catchAsync(async (req: Request, res: Response) => {
    await AuthService.resetPassword(req.body.token, req.body.password);
    sendSuccess(res, 200, {
      message: 'Password reset successful',
    });
  });
}
