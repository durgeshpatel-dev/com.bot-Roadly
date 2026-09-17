import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models/User';

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Roadly Admin';

  if (!email) {
    throw new Error('ADMIN_EMAIL is required for the development admin seed');
  }

  await mongoose.connect(env.MONGODB_URI);

  let user = await User.findOne({ email }).select('+password');

  if (!user) {
    if (!password) {
      throw new Error('ADMIN_PASSWORD is required when creating a new admin');
    }

    user = new User({
      name,
      email,
      password,
      role: 'admin',
      isVerified: true,
    });
  } else {
    user.role = 'admin';
    user.isVerified = true;
  }

  await user.save();
  console.log(`Development admin ready: ${user.email}`);
};

seedAdmin()
  .catch((error) => {
    console.error('Admin seed failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
