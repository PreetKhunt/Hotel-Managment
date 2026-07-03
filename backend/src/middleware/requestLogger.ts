import morgan, { StreamOptions } from 'morgan';
import { logger } from '../utils/logger';
import { env } from '../config/env';

// Map morgan logging stream output into Winston info level logs
const stream: StreamOptions = {
  write: (message) => logger.info(message.trim()),
};

// Skip morgan requests logging if we are running in production/test unless desired
const skip = () => {
  const isTest = env.NODE_ENV === 'test';
  return isTest;
};

export const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);
