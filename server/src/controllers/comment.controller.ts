import { Request, Response } from 'express';
import { commentService } from '../services/comment.service';
import { sendSuccess } from '../utils/response';
import { catchAsync } from '../utils/catchAsync';

export const createComment = catchAsync(async (req: Request, res: Response) => {
  const comment = await commentService.createComment(
    req.params.postId as string,
    (req.user as any).id,
    req.body.content,
    req.body.parentComment
  );
  sendSuccess(res, 201, { comment });
});

export const getComments = catchAsync(async (req: Request, res: Response) => {
  const result = await commentService.getCommentsByPost(req.params.postId as string, req.query as any);
  sendSuccess(res, 200, { comments: result.comments }, result.meta);
});

export const updateComment = catchAsync(async (req: Request, res: Response) => {
  const comment = await commentService.updateComment(
    req.params.id as string,
    (req.user as any).id,
    req.user!.role,
    req.body.content
  );
  sendSuccess(res, 200, { comment });
});

export const deleteComment = catchAsync(async (req: Request, res: Response) => {
  await commentService.deleteComment(
    req.params.id as string,
    (req.user as any).id,
    req.user!.role
  );
  sendSuccess(res, 200, { message: 'Comment deleted successfully' });
});
