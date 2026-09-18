import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { Post } from '../src/models/Post';
import { User } from '../src/models/User';
import { signAccessToken } from '../src/utils/jwt';

describe('Admin stats API', () => {
  let userId: string;
  let userToken: string;
  let adminToken: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});

    const user = await User.create({
      name: 'Stats User',
      email: 'stats-user@example.com',
      password: 'password123',
    });
    const admin = await User.create({
      name: 'Stats Admin',
      email: 'stats-admin@example.com',
      password: 'password123',
      role: 'admin',
    });
    userId = user.id;
    userToken = signAccessToken({ userId: user.id, role: 'user' });
    adminToken = signAccessToken({ userId: admin.id, role: 'admin' });
  });

  it('is restricted to admins', async () => {
    expect((await request(app).get('/api/admin/stats')).status).toBe(401);
    expect((await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${userToken}`)).status).toBe(403);
  });

  it('returns bounded aggregate totals, status counts, and safe top request lists', async () => {
    await Post.create([
      {
        title: 'Most voted request',
        description: 'A request with the highest vote count for stats.',
        categories: ['general'],
        author: userId,
        status: 'planned',
        voters: [userId],
        voteCount: 8,
        commentCount: 2,
      },
      {
        title: 'Most discussed request',
        description: 'A request with the highest comment count for stats.',
        categories: ['ui-ux'],
        author: userId,
        status: 'under-review',
        voteCount: 3,
        commentCount: 7,
      },
      {
        title: 'Completed request',
        description: 'A completed request included in status counts.',
        categories: ['performance'],
        author: userId,
        status: 'completed',
        voteCount: 1,
        commentCount: 0,
      },
    ]);

    const response = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.stats).toMatchObject({
      totalPosts: 3,
      totalVotes: 12,
      totalComments: 9,
      statusCounts: {
        'under-review': 1,
        planned: 1,
        'in-progress': 0,
        completed: 1,
        rejected: 0,
      },
    });
    expect(response.body.data.stats.topVoted[0]).toMatchObject({ title: 'Most voted request', voteCount: 8 });
    expect(response.body.data.stats.topDiscussed[0]).toMatchObject({ title: 'Most discussed request', commentCount: 7 });
    expect(response.body.data.stats.topVoted[0]).not.toHaveProperty('voters');
    expect(response.body.data.stats.topDiscussed[0]).not.toHaveProperty('voters');
  });
});
