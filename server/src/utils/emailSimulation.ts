import { env } from '../config/env';

// Explicit local assessment simulation. Production never logs bearer links.
export const simulateEmail = (purpose: 'verify-email' | 'reset-password', token: string) => {
  if (env.NODE_ENV === 'development') {
    console.info(`[EMAIL SIMULATION] ${env.CLIENT_URL}/${purpose}?token=${token}`);
  }
};
