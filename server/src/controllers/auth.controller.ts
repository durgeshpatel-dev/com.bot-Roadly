import { Request, Response } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { AuthService } from '../services/auth.service';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/response';

// Helper for cookie options
const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.COOKIE_SAME_SITE,
  path: '/api/auth',
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
    const token = req.cookies?.refreshToken;
    if (typeof token !== 'string' || !token) {
      throw new AppError('No refresh token found', 401);
    }

    const { accessToken, refreshTokenString } = await AuthService.refresh(token);

    res.cookie('refreshToken', refreshTokenString, getCookieOptions());

    sendSuccess(res, 200, {
      accessToken,
    });
  });

  static logout = catchAsync(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;
    if (typeof token === 'string' && token) {
      await AuthService.logout(token);
    }
    
    const { maxAge: _maxAge, ...clearOptions } = getCookieOptions();
    res.clearCookie('refreshToken', clearOptions);
    
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

  static registerAdmin = catchAsync(async (req: Request, res: Response) => {
    const user = await AuthService.registerAdmin(req.body);
    sendSuccess(res, 201, {
      user,
      message: 'Admin account created successfully.',
    });
  });
}
