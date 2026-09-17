import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { Post } from '../src/models/Post';
import { signAccessToken } from '../src/utils/jwt';

describe('Post API (Phase 3)', () => {
  let userToken: string;
  let adminToken: string;
  let otherUserToken: string;
  let userId: string;
  let otherUserId: string;

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

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
    });
    adminToken = signAccessToken({ userId: admin.id, role: admin.role });

    const otherUser = await User.create({
      name: 'Other User',
      email: 'other@test.com',
      password: 'password123',
      role: 'user',
    });
    otherUserId = otherUser.id;
    otherUserToken = signAccessToken({ userId: otherUser.id, role: otherUser.role });
  });

  describe('POST /api/posts', () => {
    it('should create a new post successfully', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'New Feature Request',
          description: 'This is a detailed description of the feature request.',
          categories: ['ui-ux'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.post.title).toBe('New Feature Request');
      expect(res.body.data.post.author._id.toString()).toBe(userId);
      expect(res.body.data.post.status).toBe('under-review');
    });

    it('should fail if unauthenticated', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({
          title: 'New Feature Request',
          description: 'This is a detailed description.',
          categories: ['ui-ux'],
        });

      expect(res.status).toBe(401);
    });

    it('should fail with validation errors', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Short', // Less than 5 chars
          description: 'Too short', // Less than 20 chars
          categories: ['invalid-cat'], // Invalid enum
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/posts', () => {
    beforeEach(async () => {
      await Post.create({
        title: 'First Post',
        description: 'A long enough description here.',
        categories: ['general'],
        author: userId,
        status: 'planned',
        voteCount: 10,
        commentCount: 5,
        createdAt: new Date(Date.now() - 10000), // 10s ago
      });

      await Post.create({
        title: 'Second Post UI',
        description: 'Another long description here.',
        categories: ['ui-ux'],
        author: otherUserId,
        status: 'under-review',
        voteCount: 5,
        commentCount: 2,
        createdAt: new Date(Date.now() - 5000), // 5s ago
      });

      await Post.create({
        title: 'Third Post',
        description: 'Yet another long description.',
        categories: ['performance'],
        author: userId,
        status: 'completed',
        voteCount: 20,
        commentCount: 0,
        createdAt: new Date(), // now
      });
    });

    it('should list posts with pagination', async () => {
      const res = await request(app).get('/api/posts?page=1&limit=2');
      expect(res.status).toBe(200);
      expect(res.body.data.posts.length).toBe(2);
      expect(res.body.meta.total).toBe(3);
    });

    it('should sort posts by newest by default', async () => {
      const res = await request(app).get('/api/posts');
      expect(res.body.data.posts[0].title).toBe('Third Post');
    });

    it('should sort posts by most-voted', async () => {
      const res = await request(app).get('/api/posts?sort=most-voted');
      expect(res.body.data.posts[0].title).toBe('Third Post'); // 20 votes
      expect(res.body.data.posts[1].title).toBe('First Post'); // 10 votes
    });

    it('should filter by category', async () => {
      const res = await request(app).get('/api/posts?category=ui-ux');
      expect(res.body.data.posts.length).toBe(1);
      expect(res.body.data.posts[0].title).toBe('Second Post UI');
    });

    it('should filter by status', async () => {
      const res = await request(app).get('/api/posts?status=planned,completed');
      expect(res.body.data.posts.length).toBe(2);
    });

    it('should search by text', async () => {
      const res = await request(app).get('/api/posts?search=Second');
      expect(res.body.data.posts.length).toBe(1);
      expect(res.body.data.posts[0].title).toBe('Second Post UI');
    });
  });

  describe('GET /api/posts/:id', () => {
    let postId: string;

    beforeEach(async () => {
      const post = await Post.create({
        title: 'Detail Post',
        description: 'Detail description here.',
        categories: ['general'],
        author: userId,
      });
      postId = post.id;
    });

    it('should return post detail', async () => {
      const res = await request(app).get(`/api/posts/${postId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.post.title).toBe('Detail Post');
    });

    it('should omit voters while preserving vote count and derived vote state', async () => {
      await Post.findByIdAndUpdate(postId, {
        voters: [userId],
        voteCount: 1,
      });

      const anonymousResponse = await request(app).get(`/api/posts/${postId}`);
      expect(anonymousResponse.status).toBe(200);
      expect(anonymousResponse.body.data.post.voters).toBeUndefined();
      expect(anonymousResponse.body.data.post.voteCount).toBe(1);
      expect(anonymousResponse.body.data.post.hasVoted).toBe(false);

      const authenticatedResponse = await request(app)
        .get(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(authenticatedResponse.status).toBe(200);
      expect(authenticatedResponse.body.data.post.voters).toBeUndefined();
      expect(authenticatedResponse.body.data.post.voteCount).toBe(1);
      expect(authenticatedResponse.body.data.post.hasVoted).toBe(true);
    });

    it('should return 404 for malformed ID', async () => {
      const res = await request(app).get('/api/posts/malformed-id-123');
      expect(res.status).toBe(404);
    });

    it('should return 404 for non-existent ID', async () => {
      const res = await request(app).get('/api/posts/507f1f77bcf86cd799439011');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/posts/:id', () => {
    let postId: string;

    beforeEach(async () => {
      const post = await Post.create({
        title: 'Original Title',
        description: 'Original description here.',
        categories: ['general'],
        author: userId,
      });
      postId = post.id;
    });

    it('should allow author to update post', async () => {
      const res = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Updated Title',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.post.title).toBe('Updated Title');
    });

    it('should allow admin to update post', async () => {
      const res = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Updated Title',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.post.title).toBe('Admin Updated Title');
    });

    it('should reject non-author from updating post', async () => {
      const res = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          title: 'Hacked Title',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    let postId: string;

    beforeEach(async () => {
      const post = await Post.create({
        title: 'To Be Deleted',
        description: 'This is a long enough description here.',
        categories: ['general'],
        author: userId,
      });
      postId = post.id;
    });

    it('should allow author to delete post', async () => {
      const res = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      const post = await Post.findById(postId);
      expect(post).toBeNull();
    });

    it('should allow admin to delete post', async () => {
      const res = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const post = await Post.findById(postId);
      expect(post).toBeNull();
    });

    it('should reject non-author from deleting post', async () => {
      const res = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.status).toBe(403);
      const post = await Post.findById(postId);
      expect(post).not.toBeNull();
    });
  });
});
