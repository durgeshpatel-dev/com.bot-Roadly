import { Request, Response } from 'express';
import { postService } from '../services/post.service';
import { sendSuccess } from '../utils/response';

export const createPost = async (req: Request, res: Response) => {
  const post = await postService.createPost((req.user as any).id, req.body);
  sendSuccess(res, 201, { post });
};

export const getPosts = async (req: Request, res: Response) => {
  const result = await postService.getPosts(req.query, (req.user as any)?.id);
  
  sendSuccess(res, 200, { posts: result.posts }, result.meta);
};

export const getPostById = async (req: Request, res: Response) => {
  const post = await postService.getPostById(req.params.id as string, (req.user as any)?.id);
  sendSuccess(res, 200, { post });
};

export const updatePost = async (req: Request, res: Response) => {
  const post = await postService.updatePost(req.params.id as string, (req.user as any).id, req.user!.role, req.body);
  sendSuccess(res, 200, { post });
};

export const deletePost = async (req: Request, res: Response) => {
  await postService.deletePost(req.params.id as string, (req.user as any).id, req.user!.role);
  sendSuccess(res, 200, { message: 'Post deleted successfully' });
};

export const upvotePost = async (req: Request, res: Response) => {
  const result = await postService.upvote(req.params.id as string, (req.user as any).id);
  sendSuccess(res, 200, result);
};

export const unvotePost = async (req: Request, res: Response) => {
  const result = await postService.unvote(req.params.id as string, (req.user as any).id);
  sendSuccess(res, 200, result);
};
