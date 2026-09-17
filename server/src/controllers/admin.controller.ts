import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/response';
import { adminService } from '../services/admin.service';
import { PostStatus } from '../constants/postStatus';

export const getAdminPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllPosts(req.query as Record<string, unknown>);
  sendSuccess(res, 200, { posts: result.posts }, result.meta);
});

export const updatePostStatus = catchAsync(async (req: Request, res: Response) => {
  const post = await adminService.updatePostStatus(
    req.params.id as string,
    req.body.status as PostStatus,
    (req.user as any).id
  );

  sendSuccess(res, 200, { post });
});

export const getAdminStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await adminService.getStats();
  sendSuccess(res, 200, { stats });
});
