import { Router } from 'express';
import mongoose from 'mongoose';
import { sendSuccess, sendError } from '../utils/response';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import postRoutes from './post.routes';
import adminRoutes from './admin.routes';
import roadmapRoutes from './roadmap.routes';

const router = Router();

import commentRoutes from './comment.routes';

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/admin', adminRoutes);
router.use('/roadmap', roadmapRoutes);

// Health Check Endpoint
router.get('/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
    
    if (dbState !== 1) {
      return sendError(res, 503, { 
        code: 'SERVICE_UNAVAILABLE', 
        message: 'Database is disconnected',
        dbStatus
      });
    }

    sendSuccess(res, 200, {
      status: 'ok',
      dbStatus,
      uptime: process.uptime()
    });
  } catch {
    sendError(res, 500, { 
      code: 'INTERNAL_SERVER_ERROR', 
      message: 'Health check failed' 
    });
  }
});

export default router;
