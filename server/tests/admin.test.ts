import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { Post } from '../src/models/Post';
import { signAccessToken } from '../src/utils/jwt';

describe('Admin API', () => {
  let userToken: string;
  let adminToken: string;
  let userId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});

    const user = await User.create({
      name: 'Regular User',
      email: 'regular-admin-test@example.com',
      password: 'password123',
      role: 'user',
    });
    userId = user.id;
    userToken = signAccessToken({ userId: user.id, role: 'user' });

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin-admin-test@example.com',
      password: 'password123',
      role: 'admin',
    });
    adminToken = signAccessToken({ userId: admin.id, role: 'admin' });
  });

  it('requires authentication and admin role', async () => {
    const unauthenticated = await request(app).get('/api/admin/posts');
    expect(unauthenticated.status).toBe(401);

    const regularUser = await request(app)
      .get('/api/admin/posts')
      .set('Authorization', `Bearer ${userToken}`);
    expect(regularUser.status).toBe(403);
  });

  it('lists all statuses for admins without exposing voters', async () => {
    await Post.create([
      {
        title: 'Under Review Request',
        description: 'A request that is still under review.',
        categories: ['general'],
        author: userId,
        status: 'under-review',
        voters: [userId],
        voteCount: 1,
      },
      {
        title: 'Planned Request',
        description: 'A request that has been planned.',
        categories: ['ui-ux'],
        author: userId,
        status: 'planned',
      },
    ]);

    const response = await request(app)
      .get('/api/admin/posts')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.posts).toHaveLength(2);
    expect(response.body.data.posts.map((post: { status: string }) => post.status))
      .toEqual(expect.arrayContaining(['under-review', 'planned']));
    expect(response.body.data.posts[0]).not.toHaveProperty('voters');
  });

  it.each([
    ['under-review', 'planned'],
    ['planned', 'under-review'],
    ['planned', 'in-progress'],
    ['in-progress', 'planned'],
    ['in-progress', 'completed'],
    ['completed', 'in-progress'],
  ] as const)('allows %s -> %s', async (currentStatus, nextStatus) => {
    const post = await Post.create({
      title: `${currentStatus} Request`,
      description: 'A request used to test admin status transitions.',
      categories: ['general'],
      author: userId,
      status: currentStatus,
    });

    const response = await request(app)
      .patch(`/api/admin/posts/${post.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: nextStatus });

    expect(response.status).toBe(200);
    expect(response.body.data.post.status).toBe(nextStatus);
  });

  it.each([
    ['under-review', 'in-progress'],
    ['under-review', 'completed'],
    ['planned', 'completed'],
    ['in-progress', 'under-review'],
    ['completed', 'planned'],
    ['completed', 'under-review'],
  ] as const)('rejects non-adjacent transition %s -> %s', async (currentStatus, nextStatus) => {
    const post = await Post.create({
      title: `${currentStatus} Request`,
      description: 'A request used to test invalid admin transitions.',
      categories: ['general'],
      author: userId,
      status: currentStatus,
    });

    const response = await request(app)
      .patch(`/api/admin/posts/${post.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: nextStatus });

    expect(response.status).toBe(400);
    expect((await Post.findById(post.id))?.status).toBe(currentStatus);
  });

  it('rejects invalid status input and nonexistent posts', async () => {
    const invalidStatus = await request(app)
      .patch('/api/admin/posts/507f1f77bcf86cd799439011/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'archived' });
    expect(invalidStatus.status).toBe(400);

    const nonexistentPost = await request(app)
      .patch('/api/admin/posts/507f1f77bcf86cd799439011/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'planned' });
    expect(nonexistentPost.status).toBe(404);
  });
});
