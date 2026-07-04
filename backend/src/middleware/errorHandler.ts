import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { HTTP_STATUS } from '../constants/httpStatuses';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';
import { sendError } from './apiResponse';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const errorCode = err instanceof AppError ? err.errorCode : undefined;
  const message = err.message || 'Internal Server Error';

  if (statusCode === 401 && message === 'Authentication token missing') {
    logger.debug(`[${req.method}] ${req.path} - Unauthenticated request`);
  } else if (statusCode >= 400 && statusCode < 500) {
    logger.warn(`[${req.method}] ${req.path} - Status: ${statusCode} - Message: ${message}`);
  } else {
    // Log server errors using Winston
    logger.error(
      `[${req.method}] ${req.path} - Status: ${statusCode} - Message: ${message}${
        env.NODE_ENV === 'development' ? ` - Stack: ${err.stack}` : ''
      }`
    );
  }

  sendError(res, message, statusCode, env.NODE_ENV === 'development' ? err.stack : null, errorCode);
};
