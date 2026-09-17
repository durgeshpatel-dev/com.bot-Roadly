import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { Post } from '../src/models/Post';
import { signAccessToken } from '../src/utils/jwt';

describe('Voting API (Phase 4)', () => {
  let userToken: string;
  let otherUserToken: string;
  let userId: string;
  let postId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});

    const user = await User.create({
      name: 'Test User',
      email: 'user@test.com',
      password: 'password123',
      role: 'user',
    });
    userId = user.id;
    userToken = signAccessToken({ userId: user.id, role: user.role });

    const otherUser = await User.create({
      name: 'Other User',
      email: 'other@test.com',
      password: 'password123',
      role: 'user',
    });
    otherUserToken = signAccessToken({ userId: otherUser.id, role: otherUser.role });

    const post = await Post.create({
      title: 'Vote Feature',
      description: 'Test post for voting functionality.',
      categories: ['general'],
      author: userId,
      voteCount: 0,
    });
    postId = post.id;
  });

  describe('POST /api/posts/:id/vote', () => {
    it('should upvote successfully', async () => {
      const res = await request(app)
        .post(`/api/posts/${postId}/vote`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hasVoted).toBe(true);
      expect(res.body.data.voteCount).toBe(1);

      const post = await Post.findById(postId);
      expect(post?.voteCount).toBe(1);
      expect(post?.voters.map(v => v.toString())).toContain(userId);
    });

    it('should be idempotent (repeated POST results in one active vote)', async () => {
      await request(app).post(`/api/posts/${postId}/vote`).set('Authorization', `Bearer ${userToken}`);
      
      const res = await request(app)
        .post(`/api/posts/${postId}/vote`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hasVoted).toBe(true);
      expect(res.body.data.voteCount).toBe(1); // Still 1

      const post = await Post.findById(postId);
      expect(post?.voteCount).toBe(1);
    });

    it('should allow multiple users to vote independently', async () => {
      await request(app).post(`/api/posts/${postId}/vote`).set('Authorization', `Bearer ${userToken}`);
      await request(app).post(`/api/posts/${postId}/vote`).set('Authorization', `Bearer ${otherUserToken}`);

      const post = await Post.findById(postId);
      expect(post?.voteCount).toBe(2);
    });

    it('should handle rapid concurrent upvote requests safely', async () => {
      // Send 5 requests simultaneously from the same user
      const reqs = Array(5).fill(0).map(() => 
        request(app).post(`/api/posts/${postId}/vote`).set('Authorization', `Bearer ${userToken}`)
      );
      
      await Promise.all(reqs);

      const post = await Post.findById(postId);
      expect(post?.voteCount).toBe(1); // Only counted once
    });

    it('should fail if unauthenticated', async () => {
      const res = await request(app).post(`/api/posts/${postId}/vote`);
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/posts/:id/vote', () => {
    beforeEach(async () => {
      // Pre-vote for the user
      await request(app).post(`/api/posts/${postId}/vote`).set('Authorization', `Bearer ${userToken}`);
    });

    it('should unvote successfully', async () => {
      const res = await request(app)
        .delete(`/api/posts/${postId}/vote`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hasVoted).toBe(false);
      expect(res.body.data.voteCount).toBe(0);

      const post = await Post.findById(postId);
      expect(post?.voteCount).toBe(0);
      expect(post?.voters.map(v => v.toString())).not.toContain(userId);
    });

    it('should be idempotent (repeated DELETE does not make voteCount negative)', async () => {
      // First delete
      await request(app).delete(`/api/posts/${postId}/vote`).set('Authorization', `Bearer ${userToken}`);
      
      // Second delete
      const res = await request(app)
        .delete(`/api/posts/${postId}/vote`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hasVoted).toBe(false);
      expect(res.body.data.voteCount).toBe(0); // Cannot go below 0

      const post = await Post.findById(postId);
      expect(post?.voteCount).toBe(0);
    });
  });

  describe('optionalAuth middleware', () => {
    it('should return hasVoted=false for public requests', async () => {
      const res = await request(app).get(`/api/posts/${postId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.post.hasVoted).toBe(false);
    });

    it('should return hasVoted=true when logged in and voted', async () => {
      await request(app).post(`/api/posts/${postId}/vote`).set('Authorization', `Bearer ${userToken}`);
      
      const res = await request(app)
        .get(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.post.hasVoted).toBe(true);
    });

    it('should ignore invalid token and proceed as guest (hasVoted=false)', async () => {
      await request(app).post(`/api/posts/${postId}/vote`).set('Authorization', `Bearer ${userToken}`);
      
      const res = await request(app)
        .get(`/api/posts/${postId}`)
        .set('Authorization', `Bearer invalidtoken123`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.post.hasVoted).toBe(false);
    });
  });
});
