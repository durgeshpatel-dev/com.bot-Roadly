import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models/User';
import { registerSchema } from '../middleware/validations/auth.validation';

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) throw new Error('ADMIN_EMAIL is required');
  await mongoose.connect(env.MONGODB_URI);
  await User.init();
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') {
      throw new Error('Refusing to promote an existing regular account; choose a new admin email');
    }
    console.info('Admin account already exists; no changes made');
    return;
  }
  const result = registerSchema.safeParse({
    email, password: process.env.ADMIN_PASSWORD, name: process.env.ADMIN_NAME?.trim() || 'Roadly Admin',
  });
  if (!result.success) throw new Error('Provide a valid ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD (8 characters minimum, 72 UTF-8 bytes maximum)');
  await User.create({ ...result.data, role: 'admin', isVerified: true });
  console.info('Admin account created');
};

void seedAdmin().catch(error => {
  // Database errors may contain connection credentials; print only safe setup guidance.
  const safeMessages = [
    'ADMIN_EMAIL is required',
    'Refusing to promote an existing regular account; choose a new admin email',
    'Provide a valid ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD (8 characters minimum, 72 UTF-8 bytes maximum)',
  ];
  console.error(error instanceof Error && safeMessages.includes(error.message) ? error.message : 'Admin setup failed. Check configuration and database connectivity.');
  process.exitCode = 1;
}).finally(async () => {
  await mongoose.disconnect();
});
