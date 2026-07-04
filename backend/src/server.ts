import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { startPaymentExpirer } from './workers/paymentExpirer';

// Start Background Workers
startPaymentExpirer();

// Start Express Server
const server = app.listen(env.PORT, () => {
  logger.info(`🚀 [Server]: Server is running in [${env.NODE_ENV}] mode on port: ${env.PORT}`);
  logger.info(`🔗 [Supabase]: Connected to project at ${env.SUPABASE_URL}`);
  logger.info(`⚙️ [Config]: GOOGLE_CALLBACK_URL = ${env.GOOGLE_CALLBACK_URL}`);
  logger.info(`⚙️ [Config]: CORS_ORIGIN = ${env.CORS_ORIGIN}`);
});

// Graceful Shutdown & Process Crash Handling
const handleFatalError = (error: Error, type: string) => {
  logger.error(`🚨 Fatal Exception [${type}]: ${error.message} - Stack: ${error.stack}`);
  
  if (server) {
    server.close(() => {
      logger.info('🛑 [Server]: HTTP server closed gracefully.');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

process.on('uncaughtException', (err: Error) => {
  handleFatalError(err, 'uncaughtException');
});

process.on('unhandledRejection', (reason: unknown) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  handleFatalError(err, 'unhandledRejection');
});

// Signal Termination handling (e.g. Docker, Heroku shutdown signals)
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM received. Shutting down server gracefully.');
  server.close(() => {
    logger.info('🛑 [Server]: Process terminated.');
  });
});
