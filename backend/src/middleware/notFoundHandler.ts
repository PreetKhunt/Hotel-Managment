import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../utils/AppError';
import { HTTP_STATUS } from '../constants/httpStatuses';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new AppError(`Endpoint not found: ${req.method} ${req.originalUrl}`, HTTP_STATUS.NOT_FOUND, ErrorCode.NOT_FOUND);
  next(error);
};
