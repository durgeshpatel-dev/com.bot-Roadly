import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { ipKeyGenerator } from 'express-rate-limit';
import * as limiters from '../../server/src/middleware/rateLimiter';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Cold MongoDB process startup can exceed 10 seconds on Windows/CI hosts.
  mongoServer = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  const mongoUri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri);
  await Promise.all(Object.values(mongoose.models).map(model => model.init()));
});

afterEach(async () => {
  for (const limiter of Object.values(limiters)) {
    limiter.resetKey(ipKeyGenerator('::ffff:127.0.0.1'));
    limiter.resetKey(ipKeyGenerator('127.0.0.1'));
  }
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});
