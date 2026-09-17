import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  MONGODB_URI: z.string().regex(/^mongodb(\+srv)?:\/\/\S+$/, 'A MongoDB connection URI is required'),
  JWT_SECRET: z.string().min(32, 'Use a randomly generated secret of at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'Use a separate randomly generated secret of at least 32 characters'),
  CLIENT_URL: z.url().refine(value => {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) && url.origin === value;
    } catch {
      return false;
    }
  }, 'Use an HTTP(S) origin without a path or trailing slash'),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('strict'),
  TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
}).superRefine((config, context) => {
  if (config.JWT_SECRET === config.JWT_REFRESH_SECRET) {
    context.addIssue({ code: 'custom', path: ['JWT_REFRESH_SECRET'], message: 'Access and refresh secrets must differ' });
  }
  if (config.NODE_ENV === 'production' && !config.CLIENT_URL.startsWith('https://')) {
    context.addIssue({ code: 'custom', path: ['CLIENT_URL'], message: 'Production requires an HTTPS client origin' });
  }
  if (config.COOKIE_SAME_SITE === 'none' && config.NODE_ENV !== 'production') {
    context.addIssue({ code: 'custom', path: ['COOKIE_SAME_SITE'], message: 'Cross-site cookies require production HTTPS' });
  }
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    // Only field names and fixed guidance; never print supplied environment values.
    console.error('Invalid environment configuration:', result.error.issues.map(issue => issue.path.join('.')).join(', '));
    throw new Error('Invalid environment configuration');
  }
  return result.data;
};

export const env = parseEnv();
