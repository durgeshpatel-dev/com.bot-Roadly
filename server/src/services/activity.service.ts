import mongoose from 'mongoose';
import { Activity, ActivityEventType, ActivityMetadata } from '../models/Activity';
import { Post } from '../models/Post';
import { AppError } from '../utils/AppError';

export interface ActivityRecordInput {
  postId: string | mongoose.Types.ObjectId;
  type: ActivityEventType;
  actorId: string | mongoose.Types.ObjectId;
  metadata?: ActivityMetadata;
}

export interface PublicActivityItem {
  _id: string;
  type: ActivityEventType;
  actor: { _id: string; name: string } | null;
  metadata?: ActivityMetadata;
  createdAt: Date;
}

export interface ActivityListResult {
  activities: PublicActivityItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const getPositiveInt = (value: unknown, fallback: number, maximum: number) => {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(parsed) ? Math.min(maximum, Math.max(1, parsed)) : fallback;
};

export class ActivityService {
  async record({ postId, type, actorId, metadata }: ActivityRecordInput) {
    return Activity.create({
      post: postId,
      type,
      actor: actorId,
      metadata,
    });
  }

  async getByPost(postId: string, query: Record<string, unknown>): Promise<ActivityListResult> {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new AppError('Post not found', 404);
    }

    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      throw new AppError('Post not found', 404);
    }

    const page = getPositiveInt(query.page, 1, Number.MAX_SAFE_INTEGER);
    const limit = getPositiveInt(query.limit, 20, 50);
    const skip = (page - 1) * limit;

    const [rawActivities, total] = await Promise.all([
      Activity.find({ post: postId })
        .select('type actor metadata createdAt')
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actor', 'name _id')
        .lean(),
      Activity.countDocuments({ post: postId }),
    ]);

    const activities = rawActivities.map((activity: any) => {
      const actor = activity.actor
        ? { _id: activity.actor._id.toString(), name: activity.actor.name }
        : null;
      const metadata = activity.metadata
        ? {
            ...(activity.metadata.fromStatus ? { fromStatus: activity.metadata.fromStatus } : {}),
            ...(activity.metadata.toStatus ? { toStatus: activity.metadata.toStatus } : {}),
          }
        : undefined;

      return {
        _id: activity._id.toString(),
        type: activity.type,
        actor,
        ...(metadata && Object.keys(metadata).length > 0 ? { metadata } : {}),
        createdAt: activity.createdAt,
      };
    });

    return {
      activities,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }
}

export const activityService = new ActivityService();
