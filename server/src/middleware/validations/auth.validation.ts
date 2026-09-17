import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Invalid email address').max(254);
const password = z.string().min(8, 'Password must be at least 8 characters')
  .refine(value => Buffer.byteLength(value, 'utf8') <= 72, 'Password must not exceed 72 UTF-8 bytes');
const token = z.string().regex(/^[a-f0-9]{64}$/i, 'Invalid token');
const confirmationMatches = (value: { password: string; confirmPassword?: string }) =>
  value.confirmPassword === undefined || value.password === value.confirmPassword;

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
  email, password, confirmPassword: z.string().optional(),
}).refine(confirmationMatches, { message: 'Passwords must match', path: ['confirmPassword'] });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required')
    .refine(value => Buffer.byteLength(value, 'utf8') <= 72, 'Password must not exceed 72 UTF-8 bytes'),
});
export const verifyEmailSchema = z.object({ token });
export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = z.object({
  token, password, confirmPassword: z.string().optional(),
}).refine(confirmationMatches, { message: 'Passwords must match', path: ['confirmPassword'] });
