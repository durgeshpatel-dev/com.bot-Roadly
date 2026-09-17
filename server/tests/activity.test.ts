import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { Activity } from '../src/models/Activity';
import { Comment } from '../src/models/Comment';
import { Post } from '../src/models/Post';
import { User } from '../src/models/User';
import { signAccessToken } from '../src/utils/jwt';

describe('Public activity API', () => {
  let userToken: string;
  let adminToken: string;
  let postId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Activity.deleteMany({});

    const user = await User.create({
      name: 'Activity User',
      email: 'activity-user@example.com',
      password: 'password123',
    });
    const admin = await User.create({
      name: 'Activity Admin',
      email: 'activity-admin@example.com',
      password: 'password123',
      role: 'admin',
    });
    userToken = signAccessToken({ userId: user.id, role: 'user' });
    adminToken = signAccessToken({ userId: admin.id, role: 'admin' });

    const postResponse = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Activity timeline request',
        description: 'A feature request used to verify the public activity timeline.',
        categories: ['general'],
      });
    postId = postResponse.body.data.post._id;
  });

  it('returns server-generated events with pagination and safe actor fields', async () => {
    await request(app)
      .patch(`/api/admin/posts/${postId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'planned' });

    await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'This request would be useful.' });

    const firstPage = await request(app).get(`/api/posts/${postId}/activity?page=1&limit=2`);
    expect(firstPage.status).toBe(200);
    expect(firstPage.body.data.activities).toHaveLength(2);
    expect(firstPage.body.meta).toMatchObject({ page: 1, limit: 2, total: 3, totalPages: 2, hasNextPage: true });

    const secondPage = await request(app).get(`/api/posts/${postId}/activity?page=2&limit=2`);
    expect(secondPage.status).toBe(200);
    expect(secondPage.body.data.activities).toHaveLength(1);
    expect([...firstPage.body.data.activities, ...secondPage.body.data.activities].map((event: { type: string }) => event.type))
      .toEqual(expect.arrayContaining(['post-created', 'status-changed', 'comment-created']));

    for (const event of firstPage.body.data.activities) {
      expect(event.actor).toEqual(expect.objectContaining({ name: expect.any(String), _id: expect.any(String) }));
      expect(event.actor).not.toHaveProperty('email');
      expect(event).not.toHaveProperty('password');
      expect(event).not.toHaveProperty('voters');
    }
  });

  it('returns 404 for a missing post without revealing internal data', async () => {
    const response = await request(app).get('/api/posts/507f1f77bcf86cd799439011/activity');
    expect(response.status).toBe(404);
    expect(response.body).not.toHaveProperty('stack');
  });
});
