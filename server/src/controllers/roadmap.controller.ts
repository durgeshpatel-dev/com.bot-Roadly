import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/response';
import { roadmapService } from '../services/roadmap.service';

export const getRoadmap = catchAsync(async (_req: Request, res: Response) => {
  const roadmap = await roadmapService.getRoadmap();
  sendSuccess(res, 200, roadmap);
});
