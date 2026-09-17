import mongoose from 'mongoose';
import { Post } from '../models/Post';
import { AppError } from '../utils/AppError';
import {
  isPostStatusTransitionAllowed,
  PostStatus,
} from '../constants/postStatus';
import { postService } from './post.service';
import { activityService } from './activity.service';

interface AdminStatsPost {
  _id: unknown;
  title: string;
  status: PostStatus;
  voteCount: number;
  commentCount: number;
}

export interface AdminStats {
  totalPosts: number;
  totalVotes: number;
  totalComments: number;
  statusCounts: Record<PostStatus, number>;
  topVoted: AdminStatsPost[];
  topDiscussed: AdminStatsPost[];
}

export class AdminService {
  async getAllPosts(query: Record<string, unknown>) {
    return postService.getPosts(query);
  }

  async updatePostStatus(postId: string, nextStatus: PostStatus, actorId: string) {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new AppError('Post not found', 404);
    }

    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (!isPostStatusTransitionAllowed(post.status, nextStatus)) {
      throw new AppError(
        `Invalid status transition from ${post.status} to ${nextStatus}`,
        400
      );
    }

    const previousStatus = post.status;
    const updated = await Post.findOneAndUpdate({ _id: post._id, status: previousStatus }, {
      $set: { status: nextStatus },
    }, { returnDocument: 'after', runValidators: true });
    if (!updated) throw new AppError('Post status changed. Reload before trying again.', 409);
    await activityService.record({
      postId: post._id,
      type: 'status-changed',
      actorId,
      metadata: { fromStatus: previousStatus, toStatus: nextStatus },
    }).catch(() => undefined);

    return {
      _id: post._id,
      status: updated.status,
      updatedAt: updated.updatedAt,
    };
  }

  async getStats(): Promise<AdminStats> {
    const [summary] = await Post.aggregate<{
      totalPosts: number;
      totalVotes: number;
      totalComments: number;
    }>([
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalVotes: { $sum: '$voteCount' },
          totalComments: { $sum: '$commentCount' },
        },
      },
    ]);

    const [statusGroups, topVoted, topDiscussed] = await Promise.all([
      Post.aggregate<{ _id: PostStatus; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Post.aggregate<AdminStatsPost>([
        { $sort: { voteCount: -1, createdAt: -1 } },
        { $limit: 5 },
        { $project: { title: 1, status: 1, voteCount: 1, commentCount: 1 } },
      ]),
      Post.aggregate<AdminStatsPost>([
        { $sort: { commentCount: -1, createdAt: -1 } },
        { $limit: 5 },
        { $project: { title: 1, status: 1, voteCount: 1, commentCount: 1 } },
      ]),
    ]);

    const statusCounts: Record<PostStatus, number> = {
      'under-review': 0,
      planned: 0,
      'in-progress': 0,
      completed: 0,
    };

    for (const group of statusGroups) {
      statusCounts[group._id] = group.count;
    }

    const toStatsPost = (post: any): AdminStatsPost => ({
      _id: post._id,
      title: post.title,
      status: post.status,
      voteCount: post.voteCount,
      commentCount: post.commentCount,
    });

    return {
      totalPosts: summary?.totalPosts ?? 0,
      totalVotes: summary?.totalVotes ?? 0,
      totalComments: summary?.totalComments ?? 0,
      statusCounts,
      topVoted: topVoted.map(toStatsPost),
      topDiscussed: topDiscussed.map(toStatsPost),
    };
  }
}

export const adminService = new AdminService();
