import { logger } from './logger';

export const observe = async <T>(operationName: string, fn: () => Promise<T>): Promise<T> => {
  const start = Date.now();
  try {
    return await fn();
  } finally {
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn(`🐌 [Performance] ${operationName} took ${duration}ms (Threshold: 1000ms)`);
    } else {
      logger.info(`⚡ [Performance] ${operationName} completed in ${duration}ms`);
    }
  }
};
