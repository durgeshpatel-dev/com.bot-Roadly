import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['../testing/server/setup.ts'],
    include: ['../testing/server/**/*.test.ts'],
    fileParallelism: false, // Ensure tests don't step on each other's DB
    hookTimeout: 90000, // Includes isolated MongoDB startup and index initialization.
    env: {
      NODE_ENV: 'test',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/roadly-test',
      JWT_SECRET: 'test-only-access-secret-not-for-deployment',
      JWT_REFRESH_SECRET: 'test-only-refresh-secret-not-for-deployment',
      CLIENT_URL: 'http://localhost:5173',
      COOKIE_SAME_SITE: 'strict',
      TRUST_PROXY: '0',
    },
  },
});
