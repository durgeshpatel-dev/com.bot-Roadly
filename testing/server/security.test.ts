import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../server/src/app';
import { env, envSchema } from '../../server/src/config/env';
import { User } from '../../server/src/models/User';
import { Post } from '../../server/src/models/Post';
import { Comment } from '../../server/src/models/Comment';
import { Activity } from '../../server/src/models/Activity';
import { signAccessToken } from '../../server/src/utils/jwt';

const originalEnvironment = { ...env };
afterEach(() => Object.assign(env, originalEnvironment));

describe('Release security and concurrency regressions', () => {
  let token: string;
  let userId: string;
  let postId: string;

  beforeEach(async () => {
    const user = await User.create({ name: 'Security User', email: 'security@example.com', password: 'Password123!' });
    userId = user._id.toString();
    token = signAccessToken({ userId, role: 'user' });
    const post = await Post.create({ title: 'Security checks', description: 'A feature request for regression checks.', categories: ['general'], author: userId });
    postId = post._id.toString();
  });

  it('strips protected post fields and redacts voters from create and update responses', async () => {
    const created = await request(app).post('/api/posts').set('Authorization', 'Bearer ' + token).send({
      title: '  New security request  ', description: 'A sufficiently detailed description.', categories: ['general'],
      _id: postId, author: '507f1f77bcf86cd799439011', status: 'completed', voters: [userId], voteCount: 100,
    });
    expect(created.status).toBe(201);
    expect(created.body.data.post).toMatchObject({ title: 'New security request', status: 'under-review', voteCount: 0, hasVoted: false });
    expect(created.body.data.post._id).not.toBe(postId);
    expect(created.body.data.post.voters).toBeUndefined();
    await request(app).post('/api/posts/' + postId + '/vote').set('Authorization', 'Bearer ' + token);
    const updated = await request(app).put('/api/posts/' + postId).set('Authorization', 'Bearer ' + token).send({ title: 'Updated security title', voters: [], voteCount: 0 });
    expect(updated.status).toBe(200);
    expect(updated.body.data.post.voters).toBeUndefined();
    expect(updated.body.data.post.voteCount).toBe(1);
    expect(updated.body.data.post.hasVoted).toBe(true);
  });

  it('rejects malformed pagination, enum filters, duplicate query keys and unsupported sort', async () => {
    const queries = ['page=0', 'page=2x', 'page=999999999999999999999999', 'limit=51', 'sort=trending',
      'category=invalid', 'status=deleted', 'category=general&category=ui-ux', 'category[$ne]=general',
      'search=' + 'x'.repeat(201)];
    for (const query of queries) {
      const response = await request(app).get('/api/posts?' + query);
      expect(response.status, query).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    }
    for (const resource of ['comments', 'activity']) {
      expect((await request(app).get('/api/posts/' + postId + '/' + resource + '?page=abc')).status).toBe(400);
    }
  });

  it('counts concurrent comment deletion once while retaining active replies', async () => {
    const root = await request(app).post('/api/posts/' + postId + '/comments')
      .set('Authorization', 'Bearer ' + token).send({ content: 'Root to delete' });
    const commentId = root.body.data.comment._id;
    await request(app).post('/api/posts/' + postId + '/comments').set('Authorization', 'Bearer ' + token)
      .send({ content: 'Retained reply', parentComment: commentId });
    const deletions = await Promise.all(Array.from({ length: 8 }, () =>
      request(app).delete('/api/comments/' + commentId).set('Authorization', 'Bearer ' + token)));
    expect(deletions.every(response => response.status === 200)).toBe(true);
    expect((await Post.findById(postId))?.commentCount).toBe(1);
    expect((await Comment.findById(commentId))?.content).toBe('[deleted]');
    const listed = await request(app).get('/api/posts/' + postId + '/comments');
    expect(listed.body.data.comments[0].replies[0].content).toBe('Retained reply');
  });

  it('enforces comment ownership and database roles even after deletion', async () => {
    const comment = await Comment.create({ content: 'Owned comment', author: userId, post: postId });
    const other = await User.create({ name: 'Other User', email: 'other-security@example.com', password: 'Password123!' });
    const forgedRole = signAccessToken({ userId: other._id.toString(), role: 'admin' });
    for (const method of ['put', 'delete'] as const) {
      const response = await request(app)[method]('/api/comments/' + comment._id).set('Authorization', 'Bearer ' + forgedRole).send({ content: 'Unwanted edit' });
      expect(response.status).toBe(403);
    }
    await request(app).delete('/api/comments/' + comment._id).set('Authorization', 'Bearer ' + token);
    expect((await request(app).delete('/api/comments/' + comment._id).set('Authorization', 'Bearer ' + forgedRole)).status).toBe(403);
    expect((await request(app).get('/api/admin/stats').set('Authorization', 'Bearer ' + forgedRole)).status).toBe(403);
  });

  it('cleans post comments and activities together on deletion', async () => {
    await Comment.create({ content: 'Associated comment', author: userId, post: postId });
    await Activity.create({ post: postId, actor: userId, type: 'post-created' });
    expect((await request(app).delete('/api/posts/' + postId).set('Authorization', 'Bearer ' + token)).status).toBe(200);
    expect(await Comment.countDocuments({ post: postId })).toBe(0);
    expect(await Activity.countDocuments({ post: postId })).toBe(0);
  });

  it('returns consistent safe errors for invalid JSON and oversized bodies', async () => {
    const invalid = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{"password":');
    expect(invalid.status).toBe(400);
    expect(invalid.body.error).toMatchObject({ code: 'VALIDATION_ERROR', statusCode: 400 });
    expect(invalid.body.error.stack).toBeUndefined();
    const oversized = await request(app).post('/api/auth/login').send({ password: 'x'.repeat(40_000) });
    expect(oversized.status).toBe(413);
    expect(oversized.body.error.message).not.toContain('xxxx');
  });

  it('uses secure production cookies and rejects missing cross-site origins', async () => {
    env.NODE_ENV = 'production';
    env.COOKIE_SAME_SITE = 'none';
    const credentials = { email: 'security@example.com', password: 'Password123!' };
    expect((await request(app).post('/api/auth/login').send(credentials)).status).toBe(403);
    const result = await request(app).post('/api/auth/login').set('Origin', env.CLIENT_URL).send(credentials);
    expect(result.status).toBe(200);
    expect(result.headers['set-cookie'][0]).toContain('Secure');
    expect(result.headers['set-cookie'][0]).toContain('SameSite=None');
  });

  it('rejects insecure environment configurations without accepting ambiguous origins', () => {
    for (const patch of [
      { JWT_SECRET: 'short' }, { JWT_REFRESH_SECRET: env.JWT_SECRET }, { PORT: 'bad' },
      { CLIENT_URL: 'http://localhost:5173/path' }, { CLIENT_URL: 'not-a-url' }, { NODE_ENV: 'production' },
      { COOKIE_SAME_SITE: 'none' }, { TRUST_PROXY: '-1' }, { MONGODB_URI: 'https://database.example' },
    ]) {
      expect(envSchema.safeParse({ ...originalEnvironment, ...patch }).success).toBe(false);
    }
  });
});
