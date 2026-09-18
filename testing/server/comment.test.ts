import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../server/src/app';
import { User } from '../../server/src/models/User';
import { Post } from '../../server/src/models/Post';
import { Comment } from '../../server/src/models/Comment';
import { signAccessToken } from '../../server/src/utils/jwt';

describe('Comment API', () => {
  let user1Token: string;
  let user2Token: string;
  let adminToken: string;
  let postId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});

    const user1 = await User.create({ name: 'User1', email: 'user1@test.com', password: 'password123' });
    const user2 = await User.create({ name: 'User2', email: 'user2@test.com', password: 'password123' });
    const admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'password123', role: 'admin' });

    user1Token = signAccessToken({ userId: user1._id.toString(), role: 'user' });
    user2Token = signAccessToken({ userId: user2._id.toString(), role: 'user' });
    adminToken = signAccessToken({ userId: admin._id.toString(), role: 'admin' });

    const post = await Post.create({
      title: 'Test Post',
      description: 'This is a description that exceeds 20 chars',
      author: user1._id,
      categories: ['general']
    });
    postId = post._id.toString();
  });

  it('should create a root comment and increment commentCount', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ content: 'Root comment' });

    expect(res.status).toBe(201);
    expect(res.body.data.comment.content).toBe('Root comment');

    const post = await Post.findById(postId);
    expect(post?.commentCount).toBe(1);
  });

  it('should fetch comments with nested replies', async () => {
    // Create root
    const rootRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ content: 'Root comment' });
    const rootId = rootRes.body.data.comment._id;

    // Create reply
    await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ content: 'Reply comment', parentComment: rootId });

    // Fetch
    const getRes = await request(app).get(`/api/posts/${postId}/comments`);
    expect(getRes.status).toBe(200);
    const comments = getRes.body.data.comments;
    
    expect(comments.length).toBe(1);
    expect(comments[0].content).toBe('Root comment');
    expect(comments[0].replies.length).toBe(1);
    expect(comments[0].replies[0].content).toBe('Reply comment');

    const post = await Post.findById(postId);
    expect(post?.commentCount).toBe(2);
  });

  it('should enforce max depth of 2 (no replies to replies)', async () => {
    const rootRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ content: 'Root comment' });
    
    const replyRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ content: 'Reply', parentComment: rootRes.body.data.comment._id });

    // Try to reply to the reply
    const deepReplyRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ content: 'Deep reply', parentComment: replyRes.body.data.comment._id });

    expect(deepReplyRes.status).toBe(400);
    expect(deepReplyRes.body.error.message).toMatch(/replies to replies are not allowed/i);
  });

  it('should soft delete a comment idempotently and render as [deleted]', async () => {
    const rootRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ content: 'Root comment' });
    const rootId = rootRes.body.data.comment._id;

    // First delete
    let delRes = await request(app)
      .delete(`/api/comments/${rootId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(delRes.status).toBe(200);

    let post = await Post.findById(postId);
    expect(post?.commentCount).toBe(0);

    // Second delete (idempotent)
    delRes = await request(app)
      .delete(`/api/comments/${rootId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(delRes.status).toBe(200);

    // Count should not go negative
    post = await Post.findById(postId);
    expect(post?.commentCount).toBe(0);

    // Fetch and check if content is [deleted]
    const getRes = await request(app).get(`/api/posts/${postId}/comments`);
    expect(getRes.body.data.comments[0].content).toBe('[deleted]');
    expect(getRes.body.data.comments[0].isDeleted).toBe(true);
  });

  it('should prevent editing a deleted comment', async () => {
    const rootRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ content: 'Root comment' });
    const rootId = rootRes.body.data.comment._id;

    await request(app)
      .delete(`/api/comments/${rootId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    const editRes = await request(app)
      .put(`/api/comments/${rootId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ content: 'New content' });
    
    expect(editRes.status).toBe(400);
    expect(editRes.body.error.message).toMatch(/cannot edit a deleted comment/i);
  });

  it('should allow admin to delete any comment', async () => {
    const rootRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ content: 'Root comment' });
    
    const delRes = await request(app)
      .delete(`/api/comments/${rootRes.body.data.comment._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(delRes.status).toBe(200);
  });
});
