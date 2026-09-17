import mongoose from 'mongoose';
import { Comment } from '../models/Comment';
import { paginationQuerySchema } from '../middleware/validations/post.validation';
import { Post } from '../models/Post';
import { AppError } from '../utils/AppError';
import { activityService } from './activity.service';

export class CommentService {
  async createComment(postId: string, userId: string, content: string, parentCommentId?: string | null) {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new AppError('Invalid post ID', 400);
    }

    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (parentCommentId) {
      if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
        throw new AppError('Invalid parent comment ID', 400);
      }

      const parent = await Comment.findById(parentCommentId);
      if (!parent) {
        throw new AppError('Parent comment not found', 404);
      }

      if (parent.post.toString() !== postId) {
        throw new AppError('Parent comment does not belong to this post', 400);
      }

      if (parent.parentComment) {
        throw new AppError('Replies to replies are not allowed (max depth 2)', 400);
      }
    }

    const comment = new Comment({
      content,
      author: userId,
      post: postId,
      parentComment: parentCommentId || null,
    });

    await comment.save();

    const counted = await Post.updateOne({ _id: postId }, { $inc: { commentCount: 1 } });
    if (!counted.matchedCount) {
      await Comment.deleteOne({ _id: comment._id });
      throw new AppError('Post not found', 404);
    }
    await activityService.record({ postId, type: 'comment-created', actorId: userId }).catch(() => undefined);

    return comment.populate('author', 'name _id');
  }

  async getCommentsByPost(postId: string, rawQuery: Record<string, unknown>) {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new AppError('Invalid post ID', 400);
    }

    const query = paginationQuerySchema.strict().parse(rawQuery);
    if (!await Post.exists({ _id: postId })) throw new AppError('Post not found', 404);
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;

    const [rootComments, totalRoot] = await Promise.all([
      Comment.find({ post: postId, parentComment: null })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name _id')
        .lean(),
      Comment.countDocuments({ post: postId, parentComment: null }),
    ]);

    const rootCommentIds = rootComments.map(c => c._id);

    const replies = await Comment.find({ parentComment: { $in: rootCommentIds } })
      .sort({ createdAt: 1 })
      .populate('author', 'name _id')
      .lean();

    const maskDeleted = (comment: any) => {
      if (comment.isDeleted) {
        return {
          ...comment,
          content: '[deleted]',
        };
      }
      return comment;
    };

    const repliesMap = replies.reduce((acc: any, reply: any) => {
      const parentId = reply.parentComment.toString();
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push(maskDeleted(reply));
      return acc;
    }, {});

    const nestedComments = rootComments.map(root => {
      const maskedRoot = maskDeleted(root);
      return {
        ...maskedRoot,
        replies: repliesMap[root._id.toString()] || [],
      };
    });

    return {
      comments: nestedComments,
      meta: {
        page,
        limit,
        total: totalRoot,
        totalPages: Math.ceil(totalRoot / limit),
      },
    };
  }

  async updateComment(commentId: string, userId: string, userRole: string, content: string) {
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      throw new AppError('Invalid comment ID', 400);
    }

    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.isDeleted) {
      throw new AppError('Cannot edit a deleted comment', 400);
    }

    if (comment.author.toString() !== userId && userRole !== 'admin') {
      throw new AppError('Not authorized to edit this comment', 403);
    }

    const updated = await Comment.findOneAndUpdate({ _id: commentId, isDeleted: false }, {
      $set: { content, isEdited: true },
    }, { returnDocument: 'after', runValidators: true }).populate('author', 'name _id');
    if (!updated) throw new AppError('Cannot edit a deleted comment', 400);
    return updated;
  }

  async deleteComment(commentId: string, userId: string, userRole: string) {
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      throw new AppError('Invalid comment ID', 400);
    }

    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.author.toString() !== userId && userRole !== 'admin') {
      throw new AppError('Not authorized to delete this comment', 403);
    }

    const deleted = await Comment.updateOne({ _id: commentId, isDeleted: false }, {
      $set: { isDeleted: true, content: '[deleted]' },
    });
    if (deleted.modifiedCount) {
      await Post.updateOne({ _id: comment.post, commentCount: { $gt: 0 } }, { $inc: { commentCount: -1 } });
    }

    return true;
  }
}

export const commentService = new CommentService();
