import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './AppError';

export interface JwtPayload {
  userId: string;
  role: string;
  authVersion?: number;
}

interface VerifiedPayload extends JwtPayload {
  jti?: string;
  iat: number;
  exp: number;
}

export const signAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m', algorithm: 'HS256' });

export const signRefreshToken = (payload: JwtPayload, jti: string): string =>
  jwt.sign({ ...payload, nonce: randomUUID() }, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d', algorithm: 'HS256', jwtid: jti,
  });

const verify = (token: string, secret: string): VerifiedPayload => {
  try {
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (typeof decoded === 'string' || !/^[a-f\d]{24}$/i.test(decoded.userId)
      || !['user', 'admin'].includes(decoded.role)
      || typeof decoded.iat !== 'number' || typeof decoded.exp !== 'number'
      || (decoded.authVersion !== undefined && !Number.isSafeInteger(decoded.authVersion))) {
      throw new Error('Invalid payload');
    }
    return decoded as VerifiedPayload;
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
};

export const verifyAccessToken = (token: string) => verify(token, env.JWT_SECRET);
export const verifyRefreshToken = (token: string) => {
  const decoded = verify(token, env.JWT_REFRESH_SECRET);
  if (typeof decoded.jti !== 'string' || !decoded.jti) {
    throw new AppError('Invalid token payload', 401);
  }
  return { ...decoded, jti: decoded.jti };
};
