import mongoose from 'mongoose';
import { Comment, IComment } from '../models/Comment';
import { Post } from '../models/Post';
import { AppError } from '../utils/AppError';

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

    await Post.updateOne({ _id: postId }, { $inc: { commentCount: 1 } });

    return comment.populate('author', 'name _id');
  }

  async getCommentsByPost(postId: string, query: any) {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new AppError('Invalid post ID', 400);
    }

    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 20));
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

    comment.content = content;
    comment.isEdited = true;

    await comment.save();
    return comment.populate('author', 'name _id');
  }

  async deleteComment(commentId: string, userId: string, userRole: string) {
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      throw new AppError('Invalid comment ID', 400);
    }

    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.isDeleted) {
      return true; // Idempotent
    }

    if (comment.author.toString() !== userId && userRole !== 'admin') {
      throw new AppError('Not authorized to delete this comment', 403);
    }

    comment.isDeleted = true;
    await comment.save();

    await Post.updateOne({ _id: comment.post }, { $inc: { commentCount: -1 } });

    return true;
  }
}

export const commentService = new CommentService();
