import { afterEach, describe, expect, it, vi } from 'vitest';
import request, { Response } from 'supertest';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import app from '../src/app';
import { env } from '../src/config/env';
import { User } from '../src/models/User';
import { RefreshToken } from '../src/models/RefreshToken';
import { hashToken } from '../src/utils/crypto';
import { simulateEmail } from '../src/utils/emailSimulation';
import { verifyAccessToken, verifyRefreshToken } from '../src/utils/jwt';

vi.mock('../src/utils/emailSimulation', () => ({ simulateEmail: vi.fn() }));
const credentials = { name: 'Auth User', email: 'auth@example.com', password: 'Password123!' };
const getCookie = (response: Response) => response.headers['set-cookie'][0].split(';')[0] as string;
const rawCookieToken = (cookie: string) => cookie.slice('refreshToken='.length);
const simulatedToken = (purpose: string) => {
  const call = vi.mocked(simulateEmail).mock.calls.findLast(args => args[0] === purpose);
  if (!call) throw new Error('Expected simulated email');
  return call[1];
};
const register = () => request(app).post('/api/auth/register').send(credentials);
const login = () => request(app).post('/api/auth/login').send(credentials);
const refresh = (cookie: string) => request(app).post('/api/auth/refresh').set('Cookie', cookie);

afterEach(() => vi.clearAllMocks());

describe('Authentication lifecycle and security', () => {
  it('normalizes signup, strips privileged fields, hashes passwords and verification tokens', async () => {
    const response = await request(app).post('/api/auth/register').send({
      ...credentials, name: '  Auth User  ', email: '  AUTH@EXAMPLE.COM  ', role: 'admin', isVerified: true,
    });
    expect(response.status).toBe(201);
    expect(response.body.data.user).toMatchObject({ name: 'Auth User', email: credentials.email, role: 'user', isVerified: false });
    expect(JSON.stringify(response.body)).not.toMatch(/password|verificationToken|authVersion/);
    const user = await User.findOne({ email: credentials.email }).select('+password +verificationToken +verificationTokenExpiry');
    expect(user?.password).toMatch(/^\$2[aby]\$12\$/);
    expect(user?.password).not.toBe(credentials.password);
    expect(user?.verificationToken).toBe(hashToken(simulatedToken('verify-email')));
    expect(user?.verificationTokenExpiry!.getTime()).toBeGreaterThan(Date.now() + 23 * 60 * 60 * 1000);
  });

  it('returns conflict for concurrent duplicate registration', async () => {
    const responses = await Promise.all([register(), register()]);
    expect(responses.map(response => response.status).sort()).toEqual([201, 409]);
    expect(await User.countDocuments()).toBe(1);
  });

  it('rejects malformed inputs and passwords exceeding bcrypt UTF-8 capacity', async () => {
    for (const update of [{ email: { $ne: null } }, { name: '  ' }, { password: 'short' }, { password: 'é'.repeat(37) }]) {
      const response = await request(app).post('/api/auth/register').send({ ...credentials, ...update });
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('verifies email exactly once and rejects expired verification', async () => {
    await register();
    const token = simulatedToken('verify-email');
    const attempts = await Promise.all([1, 2].map(() => request(app).post('/api/auth/verify-email').send({ token })));
    expect(attempts.map(response => response.status).sort()).toEqual([200, 400]);
    expect((await User.findOne({ email: credentials.email }))?.isVerified).toBe(true);
    await User.updateOne({ email: credentials.email }, {
      verificationToken: hashToken(token), verificationTokenExpiry: new Date(Date.now() - 1000),
    });
    expect((await request(app).post('/api/auth/verify-email').send({ token })).status).toBe(400);
  });

  it('issues 15-minute access and 7-day refresh tokens with restricted cookies and safe identity', async () => {
    await register();
    const response = await login();
    expect(response.status).toBe(200);
    const cookie = response.headers['set-cookie'][0];
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Path=/api/auth');
    expect(cookie).toContain('SameSite=Strict');
    expect(cookie).toContain('Max-Age=604800');
    expect(response.headers['cache-control']).toBe('no-store');
    const access = verifyAccessToken(response.body.data.accessToken);
    const refreshPayload = verifyRefreshToken(rawCookieToken(getCookie(response)));
    expect(access.exp - access.iat).toBe(900);
    expect(refreshPayload.exp - refreshPayload.iat).toBe(604800);
    const session = await RefreshToken.findOne({ jti: refreshPayload.jti });
    expect(session?.token).toBe(hashToken(rawCookieToken(getCookie(response))));
    const me = await request(app).get('/api/users/me').set('Authorization', 'Bearer ' + response.body.data.accessToken);
    expect(me.status).toBe(200);
    expect(Object.keys(me.body.data.user).sort()).toEqual(['_id', 'email', 'isVerified', 'name', 'role']);
  });

  it('returns generic errors for missing users and incorrect passwords', async () => {
    const missing = await login();
    await register();
    const incorrect = await request(app).post('/api/auth/login').send({ ...credentials, password: 'incorrect' });
    expect(missing.status).toBe(401);
    expect(incorrect.body).toEqual(missing.body);
  });

  it('rotates unique tokens immediately and revokes every session on old-token replay', async () => {
    await register();
    const first = await login();
    const secondSession = await login();
    const rotated = await refresh(getCookie(first));
    expect(rotated.status).toBe(200);
    expect(getCookie(rotated)).not.toBe(getCookie(first));
    expect(verifyRefreshToken(rawCookieToken(getCookie(rotated))).jti)
      .toBe(verifyRefreshToken(rawCookieToken(getCookie(first))).jti);
    expect((await refresh(getCookie(first))).status).toBe(401);
    expect((await refresh(getCookie(rotated))).status).toBe(401);
    expect((await refresh(getCookie(secondSession))).status).toBe(401);
    expect(await RefreshToken.countDocuments({ isRevoked: false })).toBe(0);
  });

  it('fails closed on concurrent refreshes of the same token', async () => {
    await register();
    const initial = await login();
    const results = await Promise.all([refresh(getCookie(initial)), refresh(getCookie(initial))]);
    expect(results.map(response => response.status).sort()).toEqual([200, 401]);
    expect(await RefreshToken.countDocuments({ isRevoked: false })).toBe(0);
    const successful = results.find(response => response.status === 200)!;
    expect((await refresh(getCookie(successful))).status).toBe(401);
  });

  it('rejects missing, malformed, expired and wrong-purpose tokens', async () => {
    await register();
    const response = await login();
    const user = response.body.data.user;
    const expired = jwt.sign({ userId: user._id, role: 'user' }, env.JWT_REFRESH_SECRET, { expiresIn: -1, jwtid: randomUUID() });
    for (const cookie of ['refreshToken=garbage', 'refreshToken=' + expired, 'refreshToken=' + response.body.data.accessToken]) {
      expect((await refresh(cookie)).status).toBe(401);
    }
    expect((await request(app).post('/api/auth/refresh')).status).toBe(401);
    expect((await request(app).get('/api/users/me').set('Authorization', 'Bearer ' + rawCookieToken(getCookie(response)))).status).toBe(401);
  });

  it('uses current database role and rejects missing users at refresh', async () => {
    await register();
    const response = await login();
    await User.updateOne({ email: credentials.email }, { role: 'admin' });
    const rotated = await refresh(getCookie(response));
    expect(verifyAccessToken(rotated.body.data.accessToken).role).toBe('admin');
    await User.deleteMany({});
    expect((await refresh(getCookie(rotated))).status).toBe(401);
  });

  it('logs out and expires the same restricted cookie', async () => {
    await register();
    const response = await login();
    const logout = await request(app).post('/api/auth/logout')
      .set('Cookie', getCookie(response));
    expect(logout.status).toBe(200);
    expect(logout.headers['set-cookie'][0]).toContain('Path=/api/auth');
    expect(logout.headers['set-cookie'][0]).toContain('Expires=Thu, 01 Jan 1970');
    expect(logout.headers['set-cookie'][0]).not.toContain('Max-Age=604800');
    expect((await refresh(getCookie(response))).status).toBe(401);
  });

  it('keeps forgot-password responses generic and resets once while invalidating all old credentials', async () => {
    await register();
    const initial = await login();
    const unknown = await request(app).post('/api/auth/forgot-password').send({ email: 'missing@example.com' });
    const known = await request(app).post('/api/auth/forgot-password').send({ email: credentials.email });
    expect(known.body).toEqual(unknown.body);
    const token = simulatedToken('reset-password');
    const user = await User.findOne({ email: credentials.email }).select('+resetPasswordToken +resetPasswordTokenExpiry');
    expect(user?.resetPasswordToken).toBe(hashToken(token));
    expect(user?.resetPasswordTokenExpiry!.getTime()).toBeLessThanOrEqual(Date.now() + 60 * 60 * 1000);
    const responses = await Promise.all([1, 2].map(() => request(app).post('/api/auth/reset-password').send({
      token, password: 'ChangedPassword123!',
    })));
    expect(responses.map(response => response.status).sort()).toEqual([200, 400]);
    expect((await refresh(getCookie(initial))).status).toBe(401);
    expect((await request(app).get('/api/users/me').set('Authorization', 'Bearer ' + initial.body.data.accessToken)).status).toBe(401);
    expect((await login()).status).toBe(401);
    expect((await request(app).post('/api/auth/login').send({ ...credentials, password: 'ChangedPassword123!' })).status).toBe(200);
  }, 15000);

  it('rejects expired password reset without changing password', async () => {
    await register();
    await request(app).post('/api/auth/forgot-password').send({ email: credentials.email });
    await User.updateOne({ email: credentials.email }, { resetPasswordTokenExpiry: new Date(Date.now() - 1000) });
    const result = await request(app).post('/api/auth/reset-password').send({ token: simulatedToken('reset-password'), password: 'OtherPassword123!' });
    expect(result.status).toBe(400);
    expect((await login()).status).toBe(200);
  });

  it('rate limits login attempts and sends retry guidance', async () => {
    const responses = [];
    for (let index = 0; index < 11; index++) {
      responses.push(await request(app).post('/api/auth/login').send({}));
    }
    expect(responses.at(-1)?.status).toBe(429);
    expect(responses.at(-1)?.body.error.code).toBe('RATE_LIMITED');
    expect(responses.at(-1)?.headers['retry-after']).toBeDefined();
  });

  it('rejects foreign origins before mutating authentication state', async () => {
    const result = await request(app).post('/api/auth/register').set('Origin', 'https://attacker.example').send(credentials);
    expect(result.status).toBe(403);
    expect(await User.countDocuments()).toBe(0);
  });
});
