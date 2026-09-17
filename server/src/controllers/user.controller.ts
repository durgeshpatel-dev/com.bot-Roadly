import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/response';

export class UserController {
  static getMe = catchAsync(async (req: Request, res: Response) => {
    // req.user is guaranteed to be set by the authenticate middleware
    sendSuccess(res, 200, {
      user: {
        _id: req.user!._id,
        name: req.user!.name,
        email: req.user!.email,
        role: req.user!.role,
        isVerified: req.user!.isVerified,
      }
    });
  });
}
