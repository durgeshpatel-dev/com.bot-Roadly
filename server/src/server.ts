import { Server } from 'node:http';
import mongoose from 'mongoose';
import app from './app';
import { env } from './config/env';
import { connectDB } from './config/database';

let server: Server | undefined;
let shuttingDown = false;

const shutdown = (exitCode: number) => {
  if (shuttingDown) return;
  shuttingDown = true;
  const timeout = setTimeout(() => process.exit(1), 10000);
  timeout.unref();
  const finish = () => {
    void mongoose.disconnect().finally(() => process.exit(exitCode));
  };
  if (server) server.close(finish);
  else finish();
};

process.on('SIGTERM', () => shutdown(0));
process.on('SIGINT', () => shutdown(0));
process.on('uncaughtException', () => {
  console.error('Uncaught server exception; shutting down');
  shutdown(1);
});
process.on('unhandledRejection', () => {
  console.error('Unhandled server rejection; shutting down');
  shutdown(1);
});

const start = async () => {
  await connectDB();
  server = app.listen(env.PORT, () => {
    console.info('Roadly API ready');
  });
};

void start().catch(() => {
  console.error('Server startup failed. Check database connectivity and configuration.');
  shutdown(1);
});
