import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { Post } from '../src/models/Post';
import { signAccessToken } from '../src/utils/jwt';

describe('Public roadmap API', () => {
  let userId: string;
  let adminToken: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});

    const user = await User.create({
      name: 'Roadmap User',
      email: 'roadmap-user@example.com',
      password: 'password123',
    });
    userId = user.id;

    const admin = await User.create({
      name: 'Roadmap Admin',
      email: 'roadmap-admin@example.com',
      password: 'password123',
      role: 'admin',
    });
    adminToken = signAccessToken({ userId: admin.id, role: 'admin' });
  });

  it('returns three public groups ordered by votes then creation time', async () => {
    await Post.create({
      title: 'Under Review',
      description: 'This request must stay out of the public roadmap.',
      categories: ['general'],
      author: userId,
      status: 'under-review',
      voteCount: 100,
    });

    await Post.create({
      title: 'Planned Older Tie',
      description: 'Older planned request with the same vote count.',
      categories: ['general'],
      author: userId,
      status: 'planned',
      voteCount: 10,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    await Post.create({
      title: 'Planned Newer Tie',
      description: 'Newer planned request with the same vote count.',
      categories: ['ui-ux'],
      author: userId,
      status: 'planned',
      voteCount: 10,
      createdAt: new Date('2026-02-01T00:00:00.000Z'),
    });

    await Post.create({
      title: 'In Progress',
      description: 'A feature currently being implemented.',
      categories: ['performance'],
      author: userId,
      status: 'in-progress',
      voteCount: 4,
    });

    const response = await request(app).get('/api/roadmap');

    expect(response.status).toBe(200);
    expect(Object.keys(response.body.data).sort()).toEqual(['completed', 'in-progress', 'planned']);
    expect(response.body.data.planned.map((post: { title: string }) => post.title))
      .toEqual(['Planned Newer Tie', 'Planned Older Tie']);
    expect(response.body.data['in-progress']).toHaveLength(1);
    expect(response.body.data.completed).toEqual([]);
    expect(response.body.data.planned[0]).not.toHaveProperty('voters');
  });

  it('reflects an admin status transition in the next roadmap query', async () => {
    const post = await Post.create({
      title: 'Moving Request',
      description: 'A request that moves from planned to in progress.',
      categories: ['integrations'],
      author: userId,
      status: 'planned',
    });

    const before = await request(app).get('/api/roadmap');
    expect(before.body.data.planned.map((item: { _id: string }) => item._id)).toContain(post.id);

    const transition = await request(app)
      .patch(`/api/admin/posts/${post.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'in-progress' });
    expect(transition.status).toBe(200);

    const after = await request(app).get('/api/roadmap');
    expect(after.body.data.planned.map((item: { _id: string }) => item._id)).not.toContain(post.id);
    expect(after.body.data['in-progress'].map((item: { _id: string }) => item._id)).toContain(post.id);
  });
});
