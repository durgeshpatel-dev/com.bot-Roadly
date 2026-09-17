import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async () => {
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  // Ensure required unique/text indexes exist before serving requests.
  await Promise.all(Object.values(mongoose.models).map(model => model.init()));
};
