import { Request, Response } from 'express';
import { activityService } from '../services/activity.service';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/response';

export const getPostActivity = catchAsync(async (req: Request, res: Response) => {
  const result = await activityService.getByPost(
    req.params.id as string,
    req.query as Record<string, unknown>
  );

  sendSuccess(res, 200, { activities: result.activities }, result.meta);
});
