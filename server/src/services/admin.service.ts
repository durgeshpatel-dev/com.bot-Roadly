import mongoose from 'mongoose';
import { Post } from '../models/Post';
import { AppError } from '../utils/AppError';
import {
  isPostStatusTransitionAllowed,
  PostStatus,
} from '../constants/postStatus';
import { postService } from './post.service';

export class AdminService {
  async getAllPosts(query: Record<string, unknown>) {
    return postService.getPosts(query);
  }

  async updatePostStatus(postId: string, nextStatus: PostStatus) {
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

    post.status = nextStatus;
    await post.save();

    return {
      _id: post._id,
      status: post.status,
      updatedAt: post.updatedAt,
    };
  }
}

export const adminService = new AdminService();
