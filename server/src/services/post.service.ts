import { Post, IPost } from '../models/Post';
import { Comment } from '../models/Comment';
import { AppError } from '../utils/AppError';
import mongoose from 'mongoose';
import { activityService } from './activity.service';
import { Activity } from '../models/Activity';
import { getPostsQuerySchema } from '../middleware/validations/post.validation';

const publicPost = <T extends { voters?: mongoose.Types.ObjectId[] }>(post: T, currentUserId?: string) => {
  const hasVoted = !!currentUserId && !!post.voters?.some(voter => voter.toString() === currentUserId);
  const result = { ...post, hasVoted };
  delete result.voters;
  return result;
};

export class PostService {
  async createPost(userId: string, data: Partial<IPost>) {
    const post = new Post({
      ...data,
      author: userId,
      status: 'under-review',
      voteCount: 0,
      commentCount: 0,
      voters: [],
    });
    
    await post.save();
    await activityService.record({ postId: post._id, type: 'post-created', actorId: userId }).catch(() => undefined);
    await post.populate('author', 'name _id');
    return publicPost(post.toObject(), userId);
  }

  async getPosts(rawQuery: Record<string, unknown>, currentUserId?: string) {
    const query = getPostsQuerySchema.parse(rawQuery);
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.category) {
      filter.categories = { $in: query.category.split(',') };
    }

    if (query.status) {
      filter.status = { $in: query.status.split(',') };
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    let sortOption: any = { createdAt: -1 };
    if (query.sort === 'most-voted') {
      sortOption = { voteCount: -1, createdAt: -1 };
    } else if (query.sort === 'most-discussed') {
      sortOption = { commentCount: -1, createdAt: -1 };
    }

    const [rawPosts, total] = await Promise.all([
      Post.find(filter)
        .select(currentUserId ? '' : '-voters')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('author', 'name _id')
        .lean(),
      Post.countDocuments(filter)
    ]);

    const posts = rawPosts.map(post => publicPost(post, currentUserId));

    return {
      posts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    };
  }

  async getPostById(postId: string, currentUserId?: string) {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new AppError('Post not found', 404);
    }

    const post = await Post.findById(postId).select(currentUserId ? '' : '-voters').populate('author', 'name _id').lean();
    
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    return publicPost(post, currentUserId);
  }

  async updatePost(postId: string, userId: string, userRole: string, data: Partial<IPost>) {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new AppError('Post not found', 404);
    }

    const post = await Post.findById(postId);
    
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (post.author.toString() !== userId && userRole !== 'admin') {
      throw new AppError('Not authorized to update this post', 403);
    }

    if (data.title) post.title = data.title;
    if (data.description) post.description = data.description;
    if (data.categories) post.categories = data.categories;

    await post.save();
    await post.populate('author', 'name _id');
    return publicPost(post.toObject(), userId);
  }

  async deletePost(postId: string, userId: string, userRole: string) {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new AppError('Post not found', 404);
    }

    const post = await Post.findById(postId);
    
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (post.author.toString() !== userId && userRole !== 'admin') {
      throw new AppError('Not authorized to delete this post', 403);
    }

    await Post.deleteOne({ _id: postId });
    await Comment.deleteMany({ post: postId });
    await Activity.deleteMany({ post: postId });

    return true;
  }

  async upvote(postId: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new AppError('Post not found', 404);
    }

    const post = await Post.findOneAndUpdate(
      { _id: postId, voters: { $ne: userId } },
      { $addToSet: { voters: userId }, $inc: { voteCount: 1 } },
      { returnDocument: 'after' }
    );

    if (!post) {
      const existingPost = await Post.findById(postId);
      if (!existingPost) {
        throw new AppError('Post not found', 404);
      }
      return { hasVoted: true, voteCount: existingPost.voteCount };
    }

    return { hasVoted: true, voteCount: post.voteCount };
  }

  async unvote(postId: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new AppError('Post not found', 404);
    }

    const post = await Post.findOneAndUpdate(
      { _id: postId, voters: userId },
      { $pull: { voters: userId }, $inc: { voteCount: -1 } },
      { returnDocument: 'after' }
    );

    if (!post) {
      const existingPost = await Post.findById(postId);
      if (!existingPost) {
        throw new AppError('Post not found', 404);
      }
      return { hasVoted: false, voteCount: existingPost.voteCount };
    }

    return { hasVoted: false, voteCount: post.voteCount };
  }
}

export const postService = new PostService();
