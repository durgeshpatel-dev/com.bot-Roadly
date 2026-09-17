import crypto from 'crypto';

/**
 * Generates a random token (32 bytes hex string)
 */
export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hashes a token using SHA-256 for secure database storage
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
